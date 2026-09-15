import type { ComponentType } from "react";
import { createRetryableLoader } from "@/app/components/retryable-loader";
import { createEffectLoaderRegistry } from "@/app/components/effects/effect-loader-utils";
import type { EffectId } from "@/app/playground/_components/effect-catalog";

export type EffectModule = { default: ComponentType };
type EffectLoader = ReturnType<typeof createRetryableLoader<EffectModule>>;
const effectLoader = (load: () => Promise<EffectModule>) => createRetryableLoader(load);

const loaders: Record<EffectId, EffectLoader> = {
  cluster: effectLoader(() => import("@/app/playground/_components/effects/ShootingStarsScenes").then((module) => ({ default: module.Cluster }))),
  "color-bubbles": effectLoader(() => import("@/app/playground/_components/effects/ColorBubbles")),
};

const loaderRegistry = createEffectLoaderRegistry(loaders);

export function getEffectLoader(id: string) {
  return loaderRegistry.getEffectLoader(id);
}
