import { NextRequest, NextResponse } from "next/server";
import { isTilDate, validateTilRecord } from "@/lib/til";
import {
  isAllowedTilOrigin,
  isTilWriteEnabled,
  readTilRecordForWrite,
  writeTilRecord,
} from "@/lib/til-write";

const MAX_TIL_BODY_BYTES = 1_000_000;

function unavailable() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function GET(request: NextRequest) {
  if (!isTilWriteEnabled()) return unavailable();

  const date = request.nextUrl.searchParams.get("date");
  if (!date || !isTilDate(date)) {
    return NextResponse.json({ error: "올바른 날짜가 필요합니다." }, { status: 400 });
  }

  return NextResponse.json({ record: readTilRecordForWrite(process.cwd(), date) });
}

export async function POST(request: NextRequest) {
  if (!isTilWriteEnabled()) return unavailable();
  if (!isAllowedTilOrigin(request.headers.get("origin"), request.headers.get("host"))) {
    return NextResponse.json({ error: "허용되지 않은 요청 출처입니다." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json({ error: "JSON 요청만 저장할 수 있습니다." }, { status: 415 });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_TIL_BODY_BYTES) {
    return NextResponse.json({ error: "기록 크기는 1MB를 넘을 수 없습니다." }, { status: 413 });
  }

  const body = await request.text();
  if (Buffer.byteLength(body, "utf8") > MAX_TIL_BODY_BYTES) {
    return NextResponse.json({ error: "기록 크기는 1MB를 넘을 수 없습니다." }, { status: 413 });
  }

  let value: unknown;
  try {
    value = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "JSON 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const validation = validateTilRecord(value);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "입력 내용을 확인해 주세요.", errors: validation.errors },
      { status: 400 },
    );
  }

  try {
    const outputPath = writeTilRecord(process.cwd(), validation.value);
    return NextResponse.json({ ok: true, date: validation.value.date, outputPath });
  } catch {
    return NextResponse.json({ error: "기록을 저장하지 못했습니다." }, { status: 500 });
  }
}
