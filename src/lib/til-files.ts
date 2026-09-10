import fs from "node:fs";
import path from "node:path";
import { isTilDate, validateTilRecord, type TilRecord } from "./til.ts";

function dailyDirectory(root: string): string {
  return path.join(root, "content", "til", "daily");
}

export function getTilRecord(date: string, root = process.cwd()): TilRecord | null {
  if (!isTilDate(date)) return null;
  try {
    const value: unknown = JSON.parse(
      fs.readFileSync(path.join(dailyDirectory(root), `${date}.json`), "utf8"),
    );
    const result = validateTilRecord(value);
    return result.ok && result.value.date === date ? result.value : null;
  } catch {
    return null;
  }
}

export function getAllTilRecords(root = process.cwd()): TilRecord[] {
  let files: string[];
  try {
    files = fs.readdirSync(dailyDirectory(root));
  } catch {
    return [];
  }

  return files
    .filter((file) => file.endsWith(".json"))
    .map((file) => path.basename(file, ".json"))
    .filter(isTilDate)
    .map((date) => getTilRecord(date, root))
    .filter((record): record is TilRecord => record !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}
