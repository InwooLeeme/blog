// Real WebGL regression check. Run with Node, then open the printed local URL
// in a browser. No headless browser dependency or production instrumentation.
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const port = Number(process.argv[2] || 3002);
const modules = new Map();
const instrumentedThree = `
export * from '/three/three.module.js';
import { WebGLRenderer as Original } from '/three/three.module.js';
export class WebGLRenderer extends Original {
  constructor(options) {
    super({ ...options, preserveDrawingBuffer: true });
    window.renderer = this;
    const render = this.render.bind(this);
    this.render = (scene, camera) => {
      render(scene, camera);
      const gl = this.getContext();
      const error = gl.getError();
      if (error !== gl.NO_ERROR && error !== gl.CONTEXT_LOST_WEBGL) window.errors.push(error);
      if (!this.getRenderTarget()) window.frames++;
    };
  }
}`;
const page = `<!doctype html><html><head><meta charset="utf-8"><title>Galaxy context recovery regression</title>
<style>body{background:#08090b;color:#ddd;font:14px monospace}iframe{width:390px;height:410px;border:1px solid #444}pre{white-space:pre-wrap}</style>
</head><body><h1>Galaxy context recovery regression</h1><iframe title="WebGL recovery test" src="/case"></iframe><pre id="result">Running…</pre>
<script>addEventListener('message',event=>{if(event.origin===location.origin&&event.source===document.querySelector('iframe').contentWindow)document.querySelector('#result').textContent=JSON.stringify(event.data,null,2)})</script></body></html>`;
const testPage = `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;overflow:hidden}canvas{width:100%;height:400px;display:block}</style></head><body>
<div id="wrapper"><canvas id="canvas"></canvas></div><script type="module">
import { mountThreeVortex } from '/source/three-vortex-renderer';
window.errors = []; window.frames = 0;
const wrapper = document.querySelector('#wrapper'), canvas = document.querySelector('#canvas');
const results = [];
let dispose;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const memory = () => ({ ...window.renderer.info.memory, programs: window.renderer.info.programs.length });
const assertNoError = () => {
  const gl = window.renderer.getContext(), error = gl.getError();
  if (error !== gl.NO_ERROR && error !== gl.CONTEXT_LOST_WEBGL) window.errors.push(error);
  assert(window.errors.length === 0, 'WebGL errors: ' + window.errors.join(', '));
};
const waitForEvent = name => new Promise((resolve,reject) => {
  const timeout = setTimeout(() => {canvas.removeEventListener(name, handler);reject(new Error(name + ' timed out'))}, 4000);
  const handler = () => {clearTimeout(timeout); resolve()};
  canvas.addEventListener(name,handler,{once:true});
});
const assertRendered = () => {
  assert(wrapper.dataset.canvasReady === 'true', 'Canvas did not recover');
  const gl = window.renderer.getContext();
  const pixels = new Uint8Array(canvas.width * canvas.height * 4);
  gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  let bright = 0;
  for (let i=0;i<pixels.length;i+=16) if(pixels[i]+pixels[i+1]+pixels[i+2]>150) bright++;
  assert(bright > 20, 'Recovered frame is blank');
  assertNoError();
};
try {
  dispose = mountThreeVortex(wrapper,canvas);
  await delay(500);
  assertRendered();
  for (const width of [390,1024,390]) {
    window.frameElement.style.width = width + 'px';
    await delay(300);
    const expectedMemory = memory();
    for(let cycle=1;cycle<=2;cycle++) {
      const ext = window.renderer.getContext().getExtension('WEBGL_lose_context');
      assert(ext, 'WEBGL_lose_context unavailable');
      const lost = waitForEvent('webglcontextlost');
      ext.loseContext(); await lost;
      const pausedFrames = window.frames;
      await delay(150);
      assert(wrapper.dataset.canvasReady === 'false', 'Fallback not shown during loss');
      assert(window.frames === pausedFrames, 'Rendering continued during context loss');
      const restored = waitForEvent('webglcontextrestored');
      ext.restoreContext(); await restored;
      // Check the synchronous recovery render, not just a later healthy frame.
      assertRendered();
      await delay(150);
      assert(window.frames > pausedFrames, 'Animation did not resume');
      assert(JSON.stringify(memory()) === JSON.stringify(expectedMemory), 'GPU resource counts grew after recovery');
      results.push({width,cycle,status:'PASS',memory:memory()});
    }
  }
  dispose(); dispose = null;
  assertNoError();
  assert(window.renderer.info.memory.geometries === 0, 'Geometry leaked after unmount');
  assert(window.renderer.info.memory.textures === 0, 'Texture leaked after unmount');
  const stoppedFrames = window.frames;
  await delay(100);
  assert(window.frames === stoppedFrames, 'Rendering continued after unmount');
  results.push({case:'unmount after recovery',status:'PASS'});
  dispose = mountThreeVortex(wrapper,canvas);
  await delay(200);
  const ext = window.renderer.getContext().getExtension('WEBGL_lose_context');
  const lost = waitForEvent('webglcontextlost');
  ext.loseContext(); await lost;
  dispose(); dispose = null;
  // Let the context-loss event finish before requesting browser restoration.
  await delay(150);
  const framesBeforeRestore = window.frames;
  const restored = waitForEvent('webglcontextrestored');
  ext.restoreContext(); await restored; await delay(150);
  assert(window.frames === framesBeforeRestore, 'Disposed renderer resumed after restoration');
  assertNoError();
  results.push({case:'unmount while context is lost',status:'PASS'});
  const report={status:'PASS',results,errors:window.errors};
  parent.postMessage(report,location.origin);
  await fetch('/result',{method:'POST',body:JSON.stringify(report)});
} catch(error) {
  dispose?.();
  const report={status:'FAIL',message:error.message,results,errors:window.errors};
  parent.postMessage(report,location.origin);
  await fetch('/result',{method:'POST',body:JSON.stringify(report)});
}
</script></body></html>`;

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    response.setHeader("Cache-Control", "no-store");
    if (url.pathname === "/result" && request.method === "POST") {
      let body = "";
      for await (const chunk of request) {
        body += chunk;
        if (body.length > 64 * 1024) throw new Error("Report too large");
      }
      const result = JSON.parse(body);
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = result.status === "PASS" ? 0 : 1;
      response.end("ok");
      server.close();
      return;
    }
    if (url.pathname === "/" || url.pathname === "/case") {
      response.setHeader("Content-Type", "text/html; charset=utf-8");
      response.end(url.pathname === "/" ? page : testPage);
      return;
    }
    response.setHeader("Content-Type", "text/javascript");
    if (url.pathname === "/instrumented-three") {
      response.end(instrumentedThree);
      return;
    }
    if (["/three/three.module.js", "/three/three.core.js"].includes(url.pathname)) {
      response.end(await fs.readFile(path.join(root, "node_modules/three/build", path.basename(url.pathname))));
      return;
    }
    const source = /^\/source\/([a-z-]+)$/.exec(url.pathname);
    if (!source) {response.writeHead(404);response.end();return;}
    if (!modules.has(source[1])) {
      const code = await fs.readFile(path.join(root, "src/app/components/home", source[1] + ".ts"), "utf8");
      modules.set(source[1], ts.transpileModule(code.replaceAll('from "three"', 'from "/instrumented-three"'), {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
      }).outputText);
    }
    response.end(modules.get(source[1]));
  } catch (error) {
    response.writeHead(500);
    response.end(String(error));
  }
});
server.listen(port, "127.0.0.1", () => console.log('Open http://localhost:' + port + '/ to run the WebGL regression check.'));
