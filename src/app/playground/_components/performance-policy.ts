export type PlaygroundView = "museum" | "grid" | "coverflow";

export function shouldRunCoverflowAnimation(
  view: PlaygroundView,
  visibilityState: DocumentVisibilityState,
) {
  return view === "coverflow" && visibilityState === "visible";
}

export function updateMountedEffects(
  current: boolean[],
  index: number,
  mounted: boolean,
) {
  if (current[index] === mounted) return current;
  return current.map((value, currentIndex) =>
    currentIndex === index ? mounted : value,
  );
}
