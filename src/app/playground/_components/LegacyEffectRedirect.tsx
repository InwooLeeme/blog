"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLegacyEffectHref } from "./effect-selection";

/** Preserve bookmarked effect links without mounting a canvas on the chooser. */
export default function LegacyEffectRedirect() {
  const router = useRouter();
  const search = useSearchParams();
  useEffect(() => {
    const destination = getLegacyEffectHref(window.location.href);
    if (destination) router.replace(destination, { scroll: false });
  }, [router, search]);
  return null;
}
