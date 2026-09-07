import { lazy, Suspense, useState, type ComponentType } from "react";
import { createRetryableLoader } from "@/app/components/retryable-loader";
import { createEffectLoaderRegistry, createLazyComponentFactory } from "@/app/components/effects/effect-loader-utils";
import { EFFECT_CATALOG, type EffectId, type EffectMeta } from "@/app/playground/_components/effect-catalog";

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

export type Effect = EffectMeta & { Component: ComponentType };

function effectComponent(id: EffectId): ComponentType {
  const createLazyEffect = createLazyComponentFactory(lazy, loaders[id]);
  return function EffectComponent() {
    const [LazyEffect] = useState(createLazyEffect);
    return (
      <Suspense fallback={null}>
        <LazyEffect />
      </Suspense>
    );
  };
}

/** 후속 소비자 마이그레이션 전까지 기존 캐러셀/미술관 API를 유지한다. */
export const EFFECTS: Effect[] = EFFECT_CATALOG.map((effect) => ({
  ...effect,
  Component: effectComponent(effect.id),
}));
