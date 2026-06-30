import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import ShootingStars from "@/app/components/ShootingStars";

export type Effect = { id: string; title: string; Component: ComponentType };

const Cluster: ComponentType = () => <ShootingStars meteors={false} forceDark />;
const MeteorSky: ComponentType = () => <ShootingStars forceDark />;

// 플레이그라운드 캔버스 효과는 무겁고 실제로는 한 번에 하나(또는 캐러셀 일부)만 보여서,
// 모듈 단위로 지연 로드해 한 번에 안 쓰는 효과까지 번들에 같이 실리는 걸 막는다.
const HyperspaceWarp = dynamic(() => import("@/app/playground/_components/effects/HyperspaceWarp"), { ssr: false });
const AuroraWaves = dynamic(() => import("@/app/playground/_components/effects/AuroraWaves"), { ssr: false });
const FlowField = dynamic(() => import("@/app/playground/_components/effects/FlowField"), { ssr: false });
const Metaballs = dynamic(() => import("@/app/playground/_components/effects/Metaballs"), { ssr: false });
const VerletCloth = dynamic(() => import("@/app/playground/_components/effects/VerletCloth"), { ssr: false });
const GravityBurst = dynamic(() => import("@/app/playground/_components/effects/GravityBurst"), { ssr: false });
const RainOnGlass = dynamic(() => import("@/app/playground/_components/effects/RainOnGlass"), { ssr: false });
const LightningArc = dynamic(() => import("@/app/playground/_components/effects/LightningArc"), { ssr: false });
const SolarEclipse = dynamic(() => import("@/app/playground/_components/effects/SolarEclipse"), { ssr: false });
const BlackHole = dynamic(() => import("@/app/playground/_components/effects/BlackHole"), { ssr: false });
const StarTrails = dynamic(() => import("@/app/playground/_components/effects/StarTrails"), { ssr: false });
const FireflyForest = dynamic(() => import("@/app/playground/_components/effects/FireflyForest"), { ssr: false });
const FluidInk = dynamic(() => import("@/app/playground/_components/effects/FluidInk"), { ssr: false });
const GrowingForest = dynamic(() => import("@/app/playground/_components/effects/GrowingForest"), { ssr: false });

/** 플레이그라운드 캐러셀과 랜딩 게이트가 함께 쓰는 이펙트 목록 */
export const EFFECTS: Effect[] = [
  { id: "cluster", title: "구상성단", Component: Cluster },
  { id: "meteor-sky", title: "별똥별 밤하늘", Component: MeteorSky },
  { id: "warp", title: "하이퍼스페이스", Component: HyperspaceWarp },
  { id: "aurora", title: "오로라 웨이브", Component: AuroraWaves },
  { id: "flow", title: "플로우 필드", Component: FlowField },
  { id: "metaballs", title: "메타볼", Component: Metaballs },
  { id: "cloth", title: "버를레 천", Component: VerletCloth },
  { id: "gravity", title: "중력 폭발", Component: GravityBurst },
  { id: "water", title: "빗방울 유리", Component: RainOnGlass },
  { id: "lightning", title: "전기 아크", Component: LightningArc },
  { id: "eclipse", title: "일식", Component: SolarEclipse },
  { id: "blackhole", title: "블랙홀", Component: BlackHole },
  { id: "star-trails", title: "별의 궤적", Component: StarTrails },
  { id: "fireflies", title: "반딧불 숲", Component: FireflyForest },
  { id: "fluid-ink", title: "잉크 유체", Component: FluidInk },
  { id: "tree-growth", title: "나무의 성장", Component: GrowingForest },
];
