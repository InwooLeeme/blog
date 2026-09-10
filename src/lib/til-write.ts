import fs from "node:fs";
import path from "node:path";
import { isTilDate, validateTilRecord, type TilRecord } from "./til.ts";
import { getTilRecord } from "./til-files.ts";

export function isTilWriteEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.TIL_WRITE_MODE === "1" && env.NODE_ENV !== "production";
}

export function isAllowedTilOrigin(origin: string | null, host: string | null): boolean {
  if (!origin || !host) return false;
  try {
    const originUrl = new URL(origin);
    const hostUrl = new URL(`http://${host}`);
    const loopbackHosts = new Set(["127.0.0.1", "localhost", "[::1]"]);
    return (
      originUrl.protocol === "http:" &&
      originUrl.host === host &&
      loopbackHosts.has(hostUrl.hostname)
    );
  } catch {
    return false;
  }
}

export function tilRecordPath(root: string, date: string): string {
  if (!isTilDate(date)) throw new Error("올바른 TIL 날짜가 필요합니다.");
  return path.join(root, "content", "til", "daily", `${date}.json`);
}

export function readTilRecordForWrite(root: string, date: string): TilRecord | null {
  return getTilRecord(date, root);
}

export function writeTilRecord(root: string, value: unknown): string {
  const result = validateTilRecord(value);
  if (!result.ok) throw new Error(result.errors.join("\n"));

  const outputPath = tilRecordPath(root, result.value.date);
  const directory = path.dirname(outputPath);
  fs.mkdirSync(directory, { recursive: true });

  const temporaryPath = path.join(
    directory,
    `.${result.value.date}.${process.pid}.${Date.now()}.tmp`,
  );

  try {
    fs.writeFileSync(temporaryPath, `${JSON.stringify(result.value, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
    fs.renameSync(temporaryPath, outputPath);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }

  return outputPath;
}
