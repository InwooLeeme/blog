#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const DEFAULT_PORT = 3002;

export function getTilWriterUrl(port = DEFAULT_PORT) {
  return `http://127.0.0.1:${port}/til/write`;
}

export function getBrowserCommand(platform, url) {
  if (platform === "darwin") return { command: "open", args: [url] };
  if (platform === "win32") return { command: "cmd", args: ["/c", "start", "", url] };
  if (platform === "linux") return { command: "xdg-open", args: [url] };
  return null;
}

function openBrowser(url) {
  const browser = getBrowserCommand(process.platform, url);
  if (!browser || process.env.TIL_SKIP_OPEN === "1") return;
  const opener = spawn(browser.command, browser.args, {
    detached: true,
    stdio: "ignore",
  });
  opener.on("error", () => {
    process.stderr.write(`브라우저를 자동으로 열지 못했습니다. 직접 접속해 주세요: ${url}\n`);
  });
  opener.unref();
}

export function launchTilWriter(port = DEFAULT_PORT) {
  const url = getTilWriterUrl(port);
  const nextCli = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  const server = spawn(
    process.execPath,
    [nextCli, "dev", "-H", "127.0.0.1", "-p", String(port)],
    {
      env: { ...process.env, TIL_WRITE_MODE: "1" },
      stdio: ["inherit", "pipe", "pipe"],
    },
  );

  let opened = false;
  const forward = (target, chunk) => {
    target.write(chunk);
    if (!opened && /ready/i.test(String(chunk))) {
      opened = true;
      process.stdout.write(`\nTIL 작성 화면: ${url}\n`);
      openBrowser(url);
    }
  };

  server.stdout.on("data", (chunk) => forward(process.stdout, chunk));
  server.stderr.on("data", (chunk) => forward(process.stderr, chunk));
  server.on("error", (error) => {
    process.stderr.write(`TIL 작성 서버를 시작하지 못했습니다: ${error.message}\n`);
    process.exitCode = 1;
  });
  server.on("exit", (code, signal) => {
    if (signal) process.exitCode = 1;
    else process.exitCode = code ?? 0;
  });

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => {
      if (!server.killed) server.kill(signal);
    });
  }

  return server;
}

const isMain = process.argv[1]
  ? import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
  : false;

if (isMain) launchTilWriter();
