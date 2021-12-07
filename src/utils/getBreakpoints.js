export default function getBreakpoints(n, max) {
  let current = 320;
  const diff = max - current;
  const breakPoints = [];
  let steps = 0;

  n ||= max < 400 ? 1 : max < 640 ? 2 : 3;

  for (let i = 1; i < n; i++) {
    steps += i;
  }

  const pixelsPerStep = diff / steps;

  n > 1 && breakPoints.push(current);

  for (let i = 1; i < n - 1; i++) {
    const next = pixelsPerStep * (n - i) + current;
    breakPoints.push(Math.round(next));
    current = next;
  }

  breakPoints.push(max);

  return [...new Set(breakPoints)];
}
