import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import ShootingStars from "@/app/components/ShootingStars";

export type Effect = {
  id: string;
  title: string;
  /** 미술관 뷰 명판에 쓰는 한 줄 설명 */
  description: string;
  Component: ComponentType;
};

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
  { id: "cluster", title: "구상성단", description: "밤하늘 한 자리에 촘촘히 모여 은은하게 깜빡이는 별 무리",Component: Cluster },
  { id: "meteor-sky", title: "별똥별 밤하늘", description: "별이 깔린 하늘을 긴 꼬리를 그으며 가로지르는 별똥별", Component: MeteorSky },
  { id: "warp", title: "하이퍼스페이스", description: "별들이 중심에서 쏟아지며 빛의 속도로 날아가는 워프 비행", Component: HyperspaceWarp },
  { id: "aurora", title: "오로라 웨이브", description: "어스름한 밤하늘에 커튼처럼 너울거리는 오로라", Component: AuroraWaves },
  { id: "flow", title: "플로우 필드", description: "노이즈 벡터장을 따라 흐르며 궤적을 남기는 입자들", Component: FlowField },
  { id: "metaballs", title: "메타볼", description: "가까워지면 부드럽게 합쳐지고 멀어지면 갈라지는 발광 방울", Component: Metaballs },
  { id: "cloth", title: "버를레 천", description: "윗줄만 고정된 채 중력과 커서에 흔들리는 그물 천", Component: VerletCloth },
  { id: "gravity", title: "중력 폭발", description: "커서를 중력원 삼아 궤도를 그리다 주기적으로 터지는 입자", Component: GravityBurst },
  { id: "water", title: "빗방울 유리", description: "유리창에 맺힌 빗방울이 배경을 굴절시키며 흘러내리는 창가", Component: RainOnGlass },
  { id: "lightning", title: "전기 아크", description: "중앙에서 커서를 향해 가지를 치며 내리꽂히는 번개", Component: LightningArc },
  { id: "eclipse", title: "일식", description: "해가 달에 가려지며 하늘이 어두워지고 코로나가 드러나는 순간", Component: SolarEclipse },
  { id: "blackhole", title: "블랙홀", description: "별 물질이 중력에 휘말려 지평선 너머로 사라지는 강착원반", Component: BlackHole },
  { id: "star-trails", title: "별의 궤적", description: "천구의 극을 중심으로 별이 원을 그리는 장노출 밤하늘", Component: StarTrails },
  { id: "fireflies", title: "반딧불 숲", description: "어두운 숲을 무작위로 떠다니며 점멸하는 반딧불", Component: FireflyForest },
  { id: "fluid-ink", title: "잉크 유체", description: "커서가 흘린 잉크가 소용돌이치며 번져 나가는 유체", Component: FluidInk },
  { id: "tree-growth", title: "나무의 성장", description: "가지를 뻗고 잎을 틔우며 천천히 자라나는 숲", Component: GrowingForest },
];
