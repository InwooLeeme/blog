"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeftIcon, ChevronRightIcon, GalleryHorizontalIcon, LandmarkIcon, LayoutGridIcon, XIcon } from "lucide-react";
import { EFFECTS, type Effect } from "@/app/components/effects/registry";
import MuseumWall from "./MuseumWall";

const CARD_W = 220;
const CARD_H = 300; // 포스터 비율
const SPACING = 150; // 옆 카드 가로 간격
const MAX_ROT = 50; // 옆 카드 회전
const DEPTH = 170; // 옆 카드 뒤로 밀기
const DRAG_PER_PX = 0.005; // px → 인덱스
const WHEEL_PER_PX = 0.0025; // 휠/트랙패드 → 인덱스
const CLICK_THRESHOLD = 8; // 이 이상 움직이면 클릭이 아니라 드래그로 간주
const SPRING_K = 120; // 스냅 스프링 강성
const SPRING_DAMP = 14; // 스프링 감쇠(낮을수록 더 튕김)
const BOB_AMP = 4; // 중앙 카드 둥실거림(px)
const TILT_AMP = 2; // 중앙 카드 미세 기울임(deg)
const HOVER_LIFT = 1.06; // 호버 시 확대 비율
const MOUNT_RANGE = 2; // 중앙 기준 이 범위 밖 카드는 캔버스 이펙트를 마운트하지 않음(성능)
const ICON_BTN = "grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20";
// 메이슨리 타일마다 결정적으로 배정하는 세로 비율(핀터레스트 리듬) — id 기반이라 리렌더에도 흔들리지 않음
const MASONRY_ASPECTS = ["aspect-[3/4]", "aspect-square", "aspect-[3/5]", "aspect-[4/5]", "aspect-[2/3]"];

type View = "museum" | "grid" | "coverflow";
const VIEWS = [
  { id: "museum", label: "미술관으로 보기", Icon: LandmarkIcon },
  { id: "grid", label: "메이슨리로 보기", Icon: LayoutGridIcon },
  { id: "coverflow", label: "커버플로우로 보기", Icon: GalleryHorizontalIcon },
] as const;

/** id 문자열을 결정적 정수로 해시(FNV-1a) — 인덱스 순서와 무관하게 비율을 흩어서 배정 */
function hashString(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** i번 카드를 중심 위치 pos 기준으로 커버플로우 배치 (가운데 정면, 양옆 3D) */
function place(i: number, pos: number) {
  const off = i - pos; // 중심에서의 부호 거리
  const clamped = Math.max(-1.6, Math.min(1.6, off));
  const ax = Math.abs(off);
  return {
    transform:
      `translate(-50%, -50%) translateX(${clamped * SPACING}px) ` +
      `translateZ(${-Math.min(ax, 2) * DEPTH}px) rotateY(${-clamped * MAX_ROT}deg) ` +
      `scale(${Math.max(0.7, 1 - ax * 0.12)})`,
    opacity: Math.max(0.25, 1 - ax * 0.45),
    zIndex: 100 - Math.round(ax * 10),
  };
}

/** 캔버스 이펙트를 마운트하거나, 가벼운 placeholder만 보여줌(성능) */
function EffectThumb({ effect, mounted }: { effect: Effect; mounted: boolean }) {
  return (
    <div className="absolute inset-0">
      {mounted ? <effect.Component /> : <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-950" />}
    </div>
  );
}

/** 코버플로우 이전/다음 화살표 */
function NavButton({ direction, disabled, onClick }: { direction: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  const Icon = direction === "prev" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "이전 이펙트" : "다음 이펙트"}
      disabled={disabled}
      onClick={onClick}
      className={`${ICON_BTN} absolute top-1/2 z-40 -translate-y-1/2 disabled:opacity-30 disabled:hover:bg-white/10 ${
        direction === "prev" ? "left-2" : "right-2"
      }`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

/** 커버플로우 갤러리 — 드래그/휠/화살표/키보드로 넘기고(스프링 스냅), 누르면 이펙트를 전체 화면으로 */
export default function EffectCarousel() {
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pos = useRef(0); // 현재 중심 위치(연속값)
  const target = useRef(0); // 스냅 목표
  const springVel = useRef(0); // 스냅 스프링 속도
  const velocity = useRef(0); // 드래그 관성 추정치
  const dragging = useRef(false);
  const lastX = useRef(0);
  const moved = useRef(0);
  const hoverIndex = useRef<number | null>(null);
  const wheelTimer = useRef<number | undefined>(undefined);
  const lastTime = useRef(0);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState<Effect | null>(null);
  const [view, setView] = useState<View>("museum");
  const [hoveredGridIndex, setHoveredGridIndex] = useState<number | null>(null);

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(EFFECTS.length - 1, i));
    target.current = clamped;
    setIndex(clamped);
  };

  // 배치는 ref로 직접 DOM에 적용해 매 프레임 리렌더 없이 갱신
  useEffect(() => {
    let raf = 0;
    const tick = (time: number) => {
      const dt = lastTime.current ? Math.min((time - lastTime.current) / 1000, 0.05) : 0;
      lastTime.current = time;

      if (!dragging.current) {
        // 스프링-댐퍼로 목표 카드에 스냅(살짝 튕기는 탄성)
        const accel = (target.current - pos.current) * SPRING_K - springVel.current * SPRING_DAMP;
        springVel.current += accel * dt;
        pos.current += springVel.current * dt;
      }

      const t = time / 1000;
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const p = place(i, pos.current);
        const closeness = Math.max(0, 1 - Math.abs(i - pos.current) * 2.2);
        const bobY = Math.sin(t * 1.4 + i) * BOB_AMP * closeness;
        const tilt = Math.sin(t * 1.1 + i * 1.7) * TILT_AMP * closeness;
        const lift = hoverIndex.current === i ? ` scale(${HOVER_LIFT})` : "";
        el.style.transform = `${p.transform} translateY(${bobY}px) rotateZ(${tilt}deg)${lift}`;
        el.style.opacity = String(p.opacity);
        el.style.zIndex = String(p.zIndex);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    springVel.current = 0;
    lastX.current = e.clientX;
    moved.current = 0;
    velocity.current = 0;
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    moved.current += Math.abs(dx);
    const d = -dx * DRAG_PER_PX;
    velocity.current = d;
    pos.current = Math.max(-0.3, Math.min(EFFECTS.length - 0.7, pos.current + d));
  };
  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    // 관성을 속도로 이어받아 스프링이 자연스럽게 이어서 멈추게 함
    springVel.current = -velocity.current * 50;
    goTo(Math.round(pos.current + velocity.current * 6));
  };

  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // 세로 휠은 페이지 스크롤에 맡김(가로 스와이프만 반응)
    e.preventDefault();
    dragging.current = true;
    pos.current = Math.max(-0.3, Math.min(EFFECTS.length - 0.7, pos.current + e.deltaX * WHEEL_PER_PX));
    window.clearTimeout(wheelTimer.current);
    wheelTimer.current = window.setTimeout(() => {
      dragging.current = false;
      goTo(Math.round(pos.current));
    }, 120);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActive(EFFECTS[index]);
    }
  };

  return (
    <>
      <div className="mb-2 flex justify-end">
        <div className="flex items-center gap-1 rounded-full border p-1">
          {VIEWS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-pressed={view === id}
              onClick={() => setView(id)}
              className={`grid h-7 w-7 place-items-center rounded-full transition ${
                view === id ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {view === "museum" && <MuseumWall onSelect={setActive} />}

      {view === "grid" && (
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {EFFECTS.map((eff, i) => (
            <button
              key={eff.id}
              type="button"
              onMouseEnter={() => setHoveredGridIndex(i)}
              onMouseLeave={() => setHoveredGridIndex((cur) => (cur === i ? null : cur))}
              onClick={() => setActive(eff)}
              className={`group relative mb-3 block w-full overflow-hidden break-inside-avoid rounded-xl border border-zinc-800/70 text-left shadow-lg transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-sky-400/60 hover:shadow-sky-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${MASONRY_ASPECTS[hashString(eff.id) % MASONRY_ASPECTS.length]}`}
            >
              <EffectThumb effect={eff} mounted={hoveredGridIndex === i} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2">
                <div className="text-xs font-medium text-zinc-100">{eff.title}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {view === "coverflow" && (
        <>
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="이펙트 갤러리"
            tabIndex={0}
            className="relative flex h-[52vh] min-h-[400px] w-full cursor-grab touch-none select-none items-center justify-center overflow-hidden outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-sky-400/60"
            style={{ perspective: "1200px" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onWheel={onWheel}
            onKeyDown={onKeyDown}
          >
            <NavButton direction="prev" disabled={index <= 0} onClick={() => goTo(index - 1)} />
            <NavButton direction="next" disabled={index >= EFFECTS.length - 1} onClick={() => goTo(index + 1)} />

            {EFFECTS.map((eff, i) => {
              const init = place(i, 0);
              return (
                <button
                  key={eff.id}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  type="button"
                  aria-label={`${eff.title} 전체 화면으로 보기`}
                  onMouseEnter={() => {
                    hoverIndex.current = i;
                  }}
                  onMouseLeave={() => {
                    if (hoverIndex.current === i) hoverIndex.current = null;
                  }}
                  onClick={() => {
                    if (moved.current < CLICK_THRESHOLD) setActive(eff);
                  }}
                  className="absolute left-1/2 top-1/2 overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-950 text-left shadow-2xl transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    transform: init.transform,
                    opacity: init.opacity,
                    zIndex: init.zIndex,
                  }}
                >
                  <EffectThumb effect={eff} mounted={Math.abs(i - index) <= MOUNT_RANGE} />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/95 to-transparent p-4">
                    <div className="text-base font-semibold text-zinc-100">{eff.title}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5">
              {EFFECTS.map((eff, i) => (
                <button
                  key={eff.id}
                  type="button"
                  aria-label={`${eff.title}로 이동`}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-sky-400" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-zinc-500">
              {index + 1} / {EFFECTS.length}
            </span>
          </div>
        </>
      )}

      <Dialog.Root open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
          <Dialog.Content className="group fixed inset-0 z-50 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95">
            <Dialog.Title className="sr-only">{active?.title ?? "이펙트"}</Dialog.Title>
            <div className="absolute inset-0 bg-zinc-950">
              {active && <active.Component />}
            </div>
            <Dialog.Close
              aria-label="닫기"
              className={`${ICON_BTN} absolute right-4 top-4 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50`}
            >
              <XIcon className="h-5 w-5" />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
