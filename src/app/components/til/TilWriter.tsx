"use client";

import { contentCardClass } from "@/lib/ui-styles";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BookOpen,
  Check,
  Code2,
  Eye,
  FilePenLine,
  Link2,
  Loader2,
  Plus,
  Save,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateTilRecord, type TilLink, type TilRecord } from "@/lib/til";
import TilRecordView from "./TilRecordView";
import {
  addAssignment,
  addLesson,
  addProjectUpdate,
  addTopic,
  clearSavedDraftIfUnchanged,
  createEmptyTilRecord,
  persistTilDraft,
  readTilDraft,
  removeAssignment,
  removeLesson,
  removeProjectUpdate,
  removeTopic,
  suggestProjectId,
} from "./til-editor-state";

const inputClass =
  "w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-accent-brand focus:ring-2 focus:ring-accent-brand/15";
const textareaClass = `${inputClass} min-h-28 resize-y [field-sizing:content] leading-6`;

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold">
        {label}
        {hint ? <span className="text-xs font-normal text-muted-foreground">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="icon" aria-label={label} title={label} onClick={onClick}>
      <Trash2 className="text-muted-foreground" />
    </Button>
  );
}

function LinkEditor({ links, onChange }: { links: TilLink[]; onChange: (links: TilLink[]) => void }) {
  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-[0.7fr_1.5fr_auto]">
          <input
            className={inputClass}
            aria-label={`링크 ${index + 1} 이름`}
            placeholder="GitHub"
            value={link.label}
            onChange={(event) =>
              onChange(links.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))
            }
          />
          <input
            className={inputClass}
            aria-label={`링크 ${index + 1} URL`}
            type="url"
            placeholder="https://..."
            value={link.url}
            onChange={(event) =>
              onChange(links.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item))
            }
          />
          <RemoveButton label={`링크 ${index + 1} 삭제`} onClick={() => onChange(links.filter((_, itemIndex) => itemIndex !== index))} />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...links, { label: "", url: "" }])}
      >
        <Link2 /> 링크 추가
      </Button>
    </div>
  );
}

export default function TilWriter({ initialDate }: { initialDate: string }) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [record, setRecord] = useState<TilRecord>(() => createEmptyTilRecord(initialDate));
  const latestRecordRef = useRef(record);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<"write" | "preview">("write");
  const [status, setStatus] = useState("기록을 불러오는 중입니다.");
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadRecord() {
      setStatus("기록을 불러오는 중입니다.");
      setErrors([]);
      const localDraft = readTilDraft(window.localStorage, selectedDate);
      if (localDraft) {
        if (!cancelled) {
          latestRecordRef.current = localDraft;
          setRecord(localDraft);
          setReady(true);
          setStatus("브라우저에 남아 있던 임시 저장본을 불러왔습니다.");
          return;
        }
      }

      try {
        const response = await fetch(`/api/til?date=${encodeURIComponent(selectedDate)}`);
        if (!response.ok) throw new Error("기록을 불러오지 못했습니다.");
        const payload = (await response.json()) as { record: TilRecord | null };
        if (!cancelled) {
          const next = payload.record ?? createEmptyTilRecord(selectedDate);
          latestRecordRef.current = next;
          setRecord(next);
          setReady(true);
          setStatus(payload.record ? "저장된 기록을 불러왔습니다." : "새 기록을 작성합니다.");
        }
      } catch (error) {
        if (!cancelled) {
          const next = createEmptyTilRecord(selectedDate);
          latestRecordRef.current = next;
          setRecord(next);
          setReady(true);
          setStatus(error instanceof Error ? error.message : "기록을 불러오지 못했습니다.");
        }
      }
    }

    void loadRecord();
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  useEffect(() => {
    if (!ready || record.date !== selectedDate) return;
    const timer = window.setTimeout(() => {
      persistTilDraft(window.localStorage, record);
      setStatus("이 브라우저에 임시 저장했습니다.");
    }, 500);
    return () => window.clearTimeout(timer);
  }, [ready, record, selectedDate]);

  function changeDate(date: string) {
    if (!date) return;
    if (ready && record.date === selectedDate) {
      persistTilDraft(window.localStorage, record);
    }
    setReady(false);
    setSelectedDate(date);
  }

  function updateRecord(next: TilRecord) {
    latestRecordRef.current = next;
    setRecord(next);
    setErrors([]);
    setStatus("변경 내용을 임시 저장하는 중입니다.");
  }

  async function save() {
    const result = validateTilRecord(record);
    if (!result.ok) {
      setErrors(result.errors);
      setStatus("입력 내용을 확인해 주세요.");
      return;
    }

    setSaving(true);
    setErrors([]);
    setStatus("파일에 저장하는 중입니다.");
    const submitted = result.value;
    persistTilDraft(window.localStorage, submitted);
    try {
      const response = await fetch("/api/til", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(submitted),
      });
      const payload = (await response.json()) as { error?: string; errors?: string[] };
      if (!response.ok) throw new Error(payload.errors?.join("\n") || payload.error || "저장하지 못했습니다.");
      const latest = latestRecordRef.current;
      if (
        latest.date === submitted.date &&
        JSON.stringify(latest) !== JSON.stringify(submitted)
      ) {
        persistTilDraft(window.localStorage, latest);
      }
      const cleared = clearSavedDraftIfUnchanged(window.localStorage, submitted);
      setStatus(
        cleared
          ? "파일에 저장했습니다. TIL 페이지에 반영됩니다."
          : "파일에 저장했고, 이후 변경 내용은 임시 저장본으로 남겼습니다.",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "기록을 저장하지 못했습니다.";
      setErrors(message.split("\n"));
      setStatus("저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <header className="sticky top-16 z-30 -mx-2 mb-8 rounded-2xl border bg-background/95 p-3 shadow-sm backdrop-blur sm:top-20 sm:mx-0 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-brand">Local TIL Writer</p>
            <h1 className="mt-1 font-display text-xl font-bold sm:text-2xl">오늘 배운 것 기록하기</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border p-1">
              <Button type="button" size="sm" variant={view === "write" ? "secondary" : "ghost"} onClick={() => setView("write")}>
                <FilePenLine /> 작성
              </Button>
              <Button type="button" size="sm" variant={view === "preview" ? "secondary" : "ghost"} onClick={() => setView("preview")}>
                <Eye /> 미리보기
              </Button>
            </div>
            <Button type="button" onClick={() => void save()} disabled={!ready || saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Save />} 파일에 저장
            </Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <input
            type="date"
            className={`${inputClass} w-auto`}
            value={selectedDate}
            onChange={(event) => changeDate(event.target.value)}
            aria-label="작성 날짜"
          />
          <p className="flex items-center gap-2 text-xs text-muted-foreground" role="status">
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
            {status}
          </p>
        </div>
      </header>

      {errors.length > 0 ? (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/8 p-4 text-sm text-destructive" role="alert">
          <p className="font-semibold">저장하기 전에 확인해 주세요.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.map((error) => <li key={error}>{error}</li>)}
          </ul>
        </div>
      ) : null}

      {!ready ? (
        <div className="flex min-h-80 items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> 기록을 준비하고 있습니다.
        </div>
      ) : view === "preview" ? (
        <div>
          <header className="mb-10 border-b pb-8">
            <p className="text-xs font-semibold text-accent-brand">{record.date}</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
              {record.summary || "한 줄 요약을 입력하면 여기에 표시됩니다."}
            </h2>
          </header>
          <TilRecordView record={record} />
        </div>
      ) : (
        <div className="space-y-10">
          <section className={cn(contentCardClass, "p-5 sm:p-7")}>
            <Field label="오늘의 한 줄 요약" hint="목록 카드와 상세 제목에 사용됩니다.">
              <input
                className={inputClass}
                placeholder="예: Spring의 의존성 주입과 Bean 생명주기를 실습했다."
                value={record.summary}
                onChange={(event) => updateRecord({ ...record, summary: event.target.value })}
              />
            </Field>
          </section>

          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BookOpen className="size-5 text-accent-brand" />
                <h2 className="font-display text-2xl font-bold">수업과 배운 내용</h2>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => updateRecord(addLesson(record))}>
                <Plus /> 수업 추가
              </Button>
            </div>

            {record.lessons.map((lesson, lessonIndex) => (
              <article key={lesson.id} className={cn(contentCardClass, "p-5 sm:p-7")}>
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <Field label={`수업 ${lessonIndex + 1} 이름`}>
                      <input
                        className={inputClass}
                        placeholder="예: Spring"
                        value={lesson.course}
                        onChange={(event) => updateRecord({
                          ...record,
                          lessons: record.lessons.map((item) => item.id === lesson.id ? { ...item, course: event.target.value } : item),
                        })}
                      />
                    </Field>
                  </div>
                  <RemoveButton label={`수업 ${lessonIndex + 1} 삭제`} onClick={() => updateRecord(removeLesson(record, lesson.id))} />
                </div>

                <div className="mt-7 space-y-5">
                  {lesson.topics.map((topic, topicIndex) => (
                    <div key={topic.id} className="rounded-xl border bg-background/65 p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold">학습 주제 {topicIndex + 1}</h3>
                        <RemoveButton label={`학습 주제 ${topicIndex + 1} 삭제`} onClick={() => updateRecord(removeTopic(record, lesson.id, topic.id))} />
                      </div>
                      <div className="mt-4 space-y-4">
                        <Field label="주제 제목">
                          <input
                            className={inputClass}
                            placeholder="예: 의존성 주입"
                            value={topic.title}
                            onChange={(event) => updateRecord({
                              ...record,
                              lessons: record.lessons.map((item) => item.id === lesson.id ? {
                                ...item,
                                topics: item.topics.map((current) => current.id === topic.id ? { ...current, title: event.target.value } : current),
                              } : item),
                            })}
                          />
                        </Field>
                        <Field label="내가 이해한 내용" hint="길게 작성해도 됩니다.">
                          <textarea
                            className={textareaClass}
                            placeholder="개념을 자신의 말로 정리해 보세요."
                            value={topic.description}
                            onChange={(event) => updateRecord({
                              ...record,
                              lessons: record.lessons.map((item) => item.id === lesson.id ? {
                                ...item,
                                topics: item.topics.map((current) => current.id === topic.id ? { ...current, description: event.target.value } : current),
                              } : item),
                            })}
                          />
                        </Field>
                        {topic.code ? (
                          <div className="space-y-3 rounded-xl border bg-zinc-950 p-4 text-zinc-100">
                            <div className="flex items-center justify-between gap-3">
                              <span className="flex items-center gap-2 text-sm font-semibold"><Code2 className="size-4" /> 코드 예제</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-zinc-300 hover:bg-white/10 hover:text-white"
                                onClick={() => updateRecord({
                                  ...record,
                                  lessons: record.lessons.map((item) => item.id === lesson.id ? {
                                    ...item,
                                    topics: item.topics.map((current) => {
                                      if (current.id !== topic.id) return current;
                                      const { code: _code, ...withoutCode } = current;
                                      void _code;
                                      return withoutCode;
                                    }),
                                  } : item),
                                })}
                              >
                                코드 제거
                              </Button>
                            </div>
                            <input
                              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-sky-400"
                              placeholder="언어 (예: java)"
                              value={topic.code.language}
                              onChange={(event) => updateRecord({
                                ...record,
                                lessons: record.lessons.map((item) => item.id === lesson.id ? {
                                  ...item,
                                  topics: item.topics.map((current) => current.id === topic.id && current.code ? { ...current, code: { ...current.code, language: event.target.value } } : current),
                                } : item),
                              })}
                            />
                            <textarea
                              className="min-h-48 w-full resize-y rounded-lg border border-white/15 bg-black/25 p-3 font-mono text-sm leading-6 outline-none [field-sizing:content] focus:border-sky-400"
                              placeholder="코드를 붙여 넣으세요."
                              spellCheck={false}
                              value={topic.code.content}
                              onChange={(event) => updateRecord({
                                ...record,
                                lessons: record.lessons.map((item) => item.id === lesson.id ? {
                                  ...item,
                                  topics: item.topics.map((current) => current.id === topic.id && current.code ? { ...current, code: { ...current.code, content: event.target.value } } : current),
                                } : item),
                              })}
                            />
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateRecord({
                              ...record,
                              lessons: record.lessons.map((item) => item.id === lesson.id ? {
                                ...item,
                                topics: item.topics.map((current) => current.id === topic.id ? { ...current, code: { language: "java", content: "" } } : current),
                              } : item),
                            })}
                          >
                            <Code2 /> 코드 예제 추가
                          </Button>
                        )}
                        <Field label="아직 궁금한 점" hint="선택 사항">
                          <textarea
                            className={textareaClass}
                            placeholder="다음에 더 알아볼 질문을 남겨 보세요."
                            value={topic.question ?? ""}
                            onChange={(event) => updateRecord({
                              ...record,
                              lessons: record.lessons.map((item) => item.id === lesson.id ? {
                                ...item,
                                topics: item.topics.map((current) => current.id === topic.id ? { ...current, question: event.target.value } : current),
                              } : item),
                            })}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => updateRecord(addTopic(record, lesson.id))}>
                    <Plus /> 학습 주제 추가
                  </Button>
                </div>

                <div className="mt-8 border-t pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold">개인 과제</h3>
                    <Button type="button" variant="outline" size="sm" onClick={() => updateRecord(addAssignment(record, lesson.id))}>
                      <Plus /> 과제 추가
                    </Button>
                  </div>
                  <div className="mt-4 space-y-4">
                    {lesson.assignments.map((assignment, assignmentIndex) => (
                      <div key={assignment.id} className="rounded-xl border bg-background/65 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm font-semibold">과제 {assignmentIndex + 1}</h4>
                          <RemoveButton label={`과제 ${assignmentIndex + 1} 삭제`} onClick={() => updateRecord(removeAssignment(record, lesson.id, assignment.id))} />
                        </div>
                        <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_auto]">
                          <Field label="과제명">
                            <input
                              className={inputClass}
                              placeholder="예: 회원 관리 API 구현"
                              value={assignment.title}
                              onChange={(event) => updateRecord({
                                ...record,
                                lessons: record.lessons.map((item) => item.id === lesson.id ? {
                                  ...item,
                                  assignments: item.assignments.map((current) => current.id === assignment.id ? { ...current, title: event.target.value } : current),
                                } : item),
                              })}
                            />
                          </Field>
                          <Field label="상태">
                            <select
                              className={inputClass}
                              value={assignment.status}
                              onChange={(event) => updateRecord({
                                ...record,
                                lessons: record.lessons.map((item) => item.id === lesson.id ? {
                                  ...item,
                                  assignments: item.assignments.map((current) => current.id === assignment.id ? { ...current, status: event.target.value as typeof assignment.status } : current),
                                } : item),
                              })}
                            >
                              <option value="completed">완료</option>
                              <option value="in-progress">진행 중</option>
                              <option value="needs-review">보완 필요</option>
                            </select>
                          </Field>
                        </div>
                        <div className="mt-4 space-y-4">
                          <Field label="과제 설명" hint="선택 사항">
                            <textarea
                              className={textareaClass}
                              placeholder="무엇을 만들었고 어떤 점을 배웠는지 적어 보세요."
                              value={assignment.description}
                              onChange={(event) => updateRecord({
                                ...record,
                                lessons: record.lessons.map((item) => item.id === lesson.id ? {
                                  ...item,
                                  assignments: item.assignments.map((current) => current.id === assignment.id ? { ...current, description: event.target.value } : current),
                                } : item),
                              })}
                            />
                          </Field>
                          <LinkEditor links={assignment.links} onChange={(links) => updateRecord({
                            ...record,
                            lessons: record.lessons.map((item) => item.id === lesson.id ? {
                              ...item,
                              assignments: item.assignments.map((current) => current.id === assignment.id ? { ...current, links } : current),
                            } : item),
                          })} />
                        </div>
                      </div>
                    ))}
                    {lesson.assignments.length === 0 ? (
                      <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">오늘 개인 과제가 없다면 비워 두세요.</p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Users className="size-5 text-accent-brand" />
                <h2 className="font-display text-2xl font-bold">팀 프로젝트 진행</h2>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => updateRecord(addProjectUpdate(record))}>
                <Plus /> 진행 기록 추가
              </Button>
            </div>
            {record.projectUpdates.map((update, updateIndex) => (
              <article key={update.id} className={cn(contentCardClass, "p-5 sm:p-7")}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">프로젝트 진행 {updateIndex + 1}</h3>
                  <RemoveButton label={`프로젝트 진행 ${updateIndex + 1} 삭제`} onClick={() => updateRecord(removeProjectUpdate(record, update.id))} />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="프로젝트 이름">
                    <input className={inputClass} placeholder="예: SKALA Market" value={update.projectName} onBlur={() => {
                      const projectId = suggestProjectId(update.projectName, update.projectId);
                      if (projectId !== update.projectId) {
                        updateRecord({ ...record, projectUpdates: record.projectUpdates.map((item) => item.id === update.id ? { ...item, projectId } : item) });
                      }
                    }} onChange={(event) => {
                      const name = event.target.value;
                      updateRecord({ ...record, projectUpdates: record.projectUpdates.map((item) => item.id === update.id ? { ...item, projectName: name } : item) });
                    }} />
                  </Field>
                  <Field label="프로젝트 ID" hint="매일 같은 값을 사용하세요.">
                    <input className={inputClass} placeholder="skala-market" value={update.projectId} onChange={(event) => updateRecord({ ...record, projectUpdates: record.projectUpdates.map((item) => item.id === update.id ? { ...item, projectId: event.target.value } : item) })} />
                  </Field>
                  <Field label="내 역할" hint="선택 사항">
                    <input className={inputClass} placeholder="예: 백엔드 API" value={update.role ?? ""} onChange={(event) => updateRecord({ ...record, projectUpdates: record.projectUpdates.map((item) => item.id === update.id ? { ...item, role: event.target.value } : item) })} />
                  </Field>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {([
                    ["progress", "오늘 진행한 일", "구현·회의·조사한 내용을 구체적으로 적어 보세요."],
                    ["decisions", "결정 사항", "팀에서 합의한 내용이 있다면 적어 보세요."],
                    ["blockers", "막힌 점", "해결이 필요한 문제를 적어 보세요."],
                    ["nextSteps", "다음 할 일", "다음 작업을 적어 보세요."],
                  ] as const).map(([key, label, placeholder]) => (
                    <Field key={key} label={label} hint={key === "progress" ? undefined : "선택 사항"}>
                      <textarea className={textareaClass} placeholder={placeholder} value={update[key] ?? ""} onChange={(event) => updateRecord({ ...record, projectUpdates: record.projectUpdates.map((item) => item.id === update.id ? { ...item, [key]: event.target.value } : item) })} />
                    </Field>
                  ))}
                </div>
                <div className="mt-4">
                  <LinkEditor links={update.links} onChange={(links) => updateRecord({ ...record, projectUpdates: record.projectUpdates.map((item) => item.id === update.id ? { ...item, links } : item) })} />
                </div>
              </article>
            ))}
            {record.projectUpdates.length === 0 ? (
              <p className={cn(contentCardClass, "border-dashed p-8 text-center text-sm text-muted-foreground")}>팀 프로젝트 활동이 있는 날에만 진행 기록을 추가하세요.</p>
            ) : null}
          </section>

          <section className={cn(contentCardClass, "p-5 sm:p-7")}>
            <Field label="오늘의 회고" hint="선택 사항">
              <textarea
                className={textareaClass}
                placeholder="잘 이해한 점, 어려웠던 점, 내일 바꾸고 싶은 점을 자유롭게 적어 보세요."
                value={record.reflection}
                onChange={(event) => updateRecord({ ...record, reflection: event.target.value })}
              />
            </Field>
          </section>
        </div>
      )}
    </div>
  );
}
