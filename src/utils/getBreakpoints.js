// @ts-check

export default function getBreakpoints(breakpoints, imageWidth) {
  if (Array.isArray(breakpoints)) {
    return breakpoints.sort((a, b) => a - b);
  }

  if (imageWidth > 5000) {
    imageWidth = 5000;
  }
  const { count, minWidth, maxWidth } = breakpoints || {};
  let min = minWidth || 320;
  let max = maxWidth || imageWidth;

  let steps =
    count || max < 400
      ? 1
      : max < 720
      ? 2
      : max < 1300
      ? 3
      : max < 1700
      ? 4
      : 5;

  const span = max - min;
  const breakPoints = [];

  const pixelsPerStep = span / steps;
  let pixelsFactor = pixelsPerStep / steps;
  steps > 1 && breakPoints.push(min);

  for (let i = 0; i < steps - 1; i++) {
    const next = Math.pow(pixelsFactor, i / (10 - i) + 1) + min;
    breakPoints.push(Math.round(next));
    min = next;
  }

  breakPoints.push(max);

  return [...new Set(breakPoints)];
}
