"use client";

import { Download, ExternalLink, FileText } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { useT } from "../LocaleProvider";

/** 이력서 PDF — public/ 에 두고 정적 파일로 서빙. 원본은 docs/resume/cv.html (Chrome 인쇄 → PDF) */
export const RESUME_PATH = "/CV_InwooLee.pdf";
const RESUME_DOWNLOAD_NAME = "CV_InwooLee.pdf";
const RESUME_UPDATED = "2026.11";

const buttonClass =
  "inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm text-muted-foreground transition hover:border-accent-brand hover:text-accent-brand";

export default function ResumeSection() {
  const t = useT();
  return (
    <section id="resume" className="scroll-mt-24">
      <div className="flex flex-wrap items-center justify-between gap-x-3">
        <SectionHeading icon={<FileText className="h-5 w-5" />}>{t("about.resume")}</SectionHeading>
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {t("about.resumeUpdated", { date: RESUME_UPDATED })}
          </span>
          <a href={RESUME_PATH} target="_blank" rel="noreferrer" className={buttonClass}>
            <ExternalLink className="h-4 w-4" aria-hidden />
            {t("about.resumeOpen")}
          </a>
          <a
            href={RESUME_PATH}
            download={RESUME_DOWNLOAD_NAME}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-accent-brand px-3 text-sm font-medium text-accent-brand-fg transition hover:opacity-90"
          >
            <Download className="h-4 w-4" aria-hidden />
            {t("about.resumeDownload")}
          </a>
        </div>
      </div>

      {/* 모바일 브라우저는 iframe 안의 PDF를 대부분 렌더링하지 못하므로 md 이상에서만 미리보기 */}
      <div className="hidden overflow-hidden rounded-lg border bg-muted/30 md:block">
        <iframe
          src={`${RESUME_PATH}#view=FitH`}
          title={t("about.resumePreview")}
          loading="lazy"
          className="h-[80vh] min-h-[640px] w-full"
        />
      </div>
      <p className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground md:hidden">
        {t("about.resumeMobileHint")}
      </p>
    </section>
  );
}
