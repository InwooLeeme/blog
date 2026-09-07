import type { ComponentType } from "react";
import { createRetryableLoader } from "@/app/components/retryable-loader";
import { createEffectLoaderRegistry } from "@/app/components/effects/effect-loader-utils";
import type { EffectId } from "@/app/playground/_components/effect-catalog";

export type EffectModule = { default: ComponentType };
type EffectLoader = ReturnType<typeof createRetryableLoader<EffectModule>>;
const effectLoader = (load: () => Promise<EffectModule>) => createRetryableLoader(load);

const loaders: Record<EffectId, EffectLoader> = {
  cluster: effectLoader(() => import("@/app/playground/_components/effects/ShootingStarsScenes").then((module) => ({ default: module.Cluster }))),
  "meteor-sky": effectLoader(() => import("@/app/playground/_components/effects/ShootingStarsScenes").then((module) => ({ default: module.MeteorSky }))),
  warp: effectLoader(() => import("@/app/playground/_components/effects/HyperspaceWarp")),
  aurora: effectLoader(() => import("@/app/playground/_components/effects/AuroraWaves")),
  flow: effectLoader(() => import("@/app/playground/_components/effects/FlowField")),
  metaballs: effectLoader(() => import("@/app/playground/_components/effects/Metaballs")),
  cloth: effectLoader(() => import("@/app/playground/_components/effects/VerletCloth")),
  gravity: effectLoader(() => import("@/app/playground/_components/effects/GravityBurst")),
  water: effectLoader(() => import("@/app/playground/_components/effects/RainOnGlass")),
  lightning: effectLoader(() => import("@/app/playground/_components/effects/LightningArc")),
  eclipse: effectLoader(() => import("@/app/playground/_components/effects/SolarEclipse")),
  blackhole: effectLoader(() => import("@/app/playground/_components/effects/BlackHole")),
  "star-trails": effectLoader(() => import("@/app/playground/_components/effects/StarTrails")),
  fireflies: effectLoader(() => import("@/app/playground/_components/effects/FireflyForest")),
  "fluid-ink": effectLoader(() => import("@/app/playground/_components/effects/FluidInk")),
  "tree-growth": effectLoader(() => import("@/app/playground/_components/effects/GrowingForest")),
  "color-bubbles": effectLoader(() => import("@/app/playground/_components/effects/ColorBubbles")),
};

const loaderRegistry = createEffectLoaderRegistry(loaders);

export function getEffectLoader(id: string) {
  return loaderRegistry.getEffectLoader(id);
}
