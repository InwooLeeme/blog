"use client";

import { useEffect, useRef, useState, type ComponentType, type PointerEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import ShootingStars from "@/app/components/ShootingStars";
import HyperspaceWarp from "./effects/HyperspaceWarp";
import AuroraWaves from "./effects/AuroraWaves";
import FlowField from "./effects/FlowField";
import VerletCloth from "./effects/VerletCloth";
import GravityBurst from "./effects/GravityBurst";
import RainOnGlass from "./effects/RainOnGlass";

type Effect = { id: string; title: string; Component: ComponentType };

const Cluster: ComponentType = () => <ShootingStars meteors={false} forceDark />;
const MeteorSky: ComponentType = () => <ShootingStars forceDark />;

const EFFECTS: Effect[] = [
  { id: "cluster", title: "구상성단", Component: Cluster },
  { id: "meteor-sky", title: "별똥별 밤하늘", Component: MeteorSky },
  { id: "warp", title: "하이퍼스페이스", Component: HyperspaceWarp },
  { id: "aurora", title: "오로라 웨이브", Component: AuroraWaves },
  { id: "flow", title: "플로우 필드", Component: FlowField },
  { id: "cloth", title: "버를레 천", Component: VerletCloth },
  { id: "gravity", title: "중력 폭발", Component: GravityBurst },
  { id: "water", title: "빗방울 유리", Component: RainOnGlass },
];

const CARD_W = 220;
const CARD_H = 300; // 포스터 비율
const SPACING = 150; // 옆 카드 가로 간격
const MAX_ROT = 50; // 옆 카드 회전
const DEPTH = 170; // 옆 카드 뒤로 밀기
const DRAG_PER_PX = 0.005; // px → 인덱스
const CLICK_THRESHOLD = 8; // 이 이상 움직이면 클릭이 아니라 드래그로 간주

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

/** 커버플로우 갤러리 — 드래그로 넘기고(스냅), 누르면 이펙트를 전체 화면으로 */
export default function EffectCarousel() {
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pos = useRef(0); // 현재 중심 위치(연속값)
  const target = useRef(0); // 스냅 목표
  const velocity = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const moved = useRef(0);
  const [active, setActive] = useState<Effect | null>(null);

  // 배치는 ref로 직접 DOM에 적용해 매 프레임 리렌더
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (!dragging.current) {
        pos.current += (target.current - pos.current) * 0.15; // 가까운 카드로 스냅
      }
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const p = place(i, pos.current);
        el.style.transform = p.transform;
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
    // 관성을 살짝 반영해 가까운 카드로 스냅
    const projected = pos.current + velocity.current * 6;
    target.current = Math.max(0, Math.min(EFFECTS.length - 1, Math.round(projected)));
  };

  return (
    <>
      <div
        className="relative flex h-[52vh] min-h-[400px] w-full cursor-grab touch-none select-none items-center justify-center overflow-hidden active:cursor-grabbing"
        style={{ perspective: "1200px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
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
              onClick={() => {
                if (moved.current < CLICK_THRESHOLD) setActive(eff);
              }}
              className="absolute left-1/2 top-1/2 overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-950 text-left shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              style={{
                width: CARD_W,
                height: CARD_H,
                transform: init.transform,
                opacity: init.opacity,
                zIndex: init.zIndex,
              }}
            >
              <div className="absolute inset-0">
                <eff.Component />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/95 to-transparent p-4">
                <div className="text-base font-semibold text-zinc-100">{eff.title}</div>
              </div>
            </button>
          );
        })}
      </div>

      <Dialog.Root open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-0 z-50 focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0">
            <Dialog.Title className="sr-only">{active?.title ?? "이펙트"}</Dialog.Title>
            <div className="absolute inset-0 bg-zinc-950">
              {active && <active.Component />}
            </div>
            <Dialog.Close
              aria-label="닫기"
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <XIcon className="h-5 w-5" />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
