import assert from "node:assert/strict";
import test from "node:test";
import { createRetryableLoader } from "./retryable-loader.ts";

test("createRetryableLoader: clears a failed load so the next attempt can retry", async () => {
  let attempts = 0;
  const loader = createRetryableLoader(async () => {
    attempts += 1;
    if (attempts === 1) throw new Error("temporary chunk failure");
    return "loaded";
  });

  await assert.rejects(loader.load(), /temporary chunk failure/);
  assert.equal(await loader.load(), "loaded");
  assert.equal(attempts, 2);
});

test("createRetryableLoader: warm absorbs a speculative load failure", async () => {
  const loader = createRetryableLoader(async () => {
    throw new Error("temporary chunk failure");
  });

  await assert.doesNotReject(loader.warm());
});
