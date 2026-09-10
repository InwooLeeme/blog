import { notFound } from "next/navigation";
import TilWriter from "@/app/components/til/TilWriter";
import { isTilWriteEnabled } from "@/lib/til-write";

export const dynamic = "force-dynamic";

function todayInKorea(): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(new Date());
}

export default function TilWritePage() {
  if (!isTilWriteEnabled()) return notFound();
  return <TilWriter initialDate={todayInKorea()} />;
}
