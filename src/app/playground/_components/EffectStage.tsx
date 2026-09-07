"use client";

import { lazy, Suspense, useMemo, useState } from "react";
import { getEffectLoader } from "@/app/components/effects/registry";
import EffectErrorBoundary from "./EffectErrorBoundary";

export function StageLoading() {
  return <div role="status" className="absolute inset-0 grid place-items-center text-xs tracking-wide text-zinc-400">장면을 준비하고 있습니다</div>;
}

export default function EffectStage({ effectId, fullscreen = false }: { effectId: string; fullscreen?: boolean }) {
  const [retryKey, setRetryKey] = useState(0);
  const loader = getEffectLoader(effectId);
  // A fresh lazy type discards React's cached rejection when retrying.
  const Effect = useMemo(() => {
    void retryKey;
    return loader ? lazy(() => loader.load()) : null;
  }, [loader, retryKey]);

  return (
    <div key={effectId} data-effect-stage={effectId} className={`relative isolate w-full overflow-hidden bg-[#05060a] animate-stage-enter motion-reduce:animate-none ${fullscreen ? "h-full" : "aspect-[16/10]"}`}>
      <EffectErrorBoundary key={`${effectId}:${retryKey}`} onRetry={() => setRetryKey((key) => key + 1)}>
        <Suspense fallback={<StageLoading />}>
          {/* The memoized lazy type changes only on loader selection or an explicit retry. */}
          {/* eslint-disable-next-line react-hooks/static-components */}
          {Effect ? <Effect /> : <div role="status" className="absolute inset-0 grid place-items-center text-sm text-zinc-400">선택할 수 있는 장면이 없습니다.</div>}
        </Suspense>
      </EffectErrorBoundary>
    </div>
  );
}
