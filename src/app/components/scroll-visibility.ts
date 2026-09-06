export function nextHeaderScrolled(
  previous: boolean,
  scrollY: number,
  onPx = 40,
  offPx = 16,
) {
  if (!previous && scrollY > onPx) return true;
  if (previous && scrollY < offPx) return false;
  return previous;
}

export function isScrollTopVisible(scrollY: number, threshold = 400) {
  return scrollY > threshold;
}
