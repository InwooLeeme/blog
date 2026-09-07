type CanvasAnimationState = {
  intersecting: boolean;
  visibilityState: DocumentVisibilityState;
  reducedMotion: boolean;
};

export function shouldAnimateCanvas(state: CanvasAnimationState) {
  return state.intersecting && state.visibilityState === "visible" && !state.reducedMotion;
}
