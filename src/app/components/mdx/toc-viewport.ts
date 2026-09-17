// Tailwind's xl breakpoint, shared by the desktop and mobile TOC effects.
export const DESKTOP_TOC_QUERY = "(min-width: 80rem)";

export function subscribeTocViewport(
  media: Pick<MediaQueryList, "matches" | "addEventListener" | "removeEventListener">,
  desktop: boolean,
  activate: () => () => void,
) {
  let cleanup: (() => void) | undefined;
  const sync = () => {
    if (media.matches === desktop) {
      cleanup ??= activate();
    } else {
      cleanup?.();
      cleanup = undefined;
    }
  };
  sync();
  media.addEventListener("change", sync);
  return () => {
    media.removeEventListener("change", sync);
    cleanup?.();
  };
}
