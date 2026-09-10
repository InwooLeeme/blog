import assert from "node:assert/strict";
import test from "node:test";
import { getBrowserCommand, getTilWriterUrl } from "./til-write.mjs";

test("getTilWriterUrl: loopback 주소와 지정 포트의 작성 화면을 가리킨다", () => {
  assert.equal(getTilWriterUrl(3002), "http://127.0.0.1:3002/til/write");
});

test("getBrowserCommand: 운영체제별 기본 브라우저 명령을 만든다", () => {
  const url = "http://127.0.0.1:3002/til/write";
  assert.deepEqual(getBrowserCommand("darwin", url), { command: "open", args: [url] });
  assert.deepEqual(getBrowserCommand("linux", url), { command: "xdg-open", args: [url] });
  assert.deepEqual(getBrowserCommand("win32", url), {
    command: "cmd",
    args: ["/c", "start", "", url],
  });
});

test("getBrowserCommand: 지원하지 않는 운영체제에서는 자동 열기를 생략한다", () => {
  assert.equal(getBrowserCommand("aix", "http://example.com"), null);
});
