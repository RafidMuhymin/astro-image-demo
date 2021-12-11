import getBreakpoints from "./getBreakpoints";
import stringifyParams from "./stringifyParams";

export default function getConfigOptions(
  imageWidth,
  breakpoints,
  formats,
  imageFormat,
  fallbackFormat,
  includeSourceFormat,
  rest
) {
  const requiredFormats = [
    ...new Set(
      [formats, includeSourceFormat && imageFormat]
        .flat()
        .filter((f) => f && f !== fallbackFormat)
    ),
    fallbackFormat,
  ];

  const requiredBreakpoints = getBreakpoints(breakpoints, imageWidth);

  const maxWidth = requiredBreakpoints.at(-1);

  const params = stringifyParams(rest);

  return {
    requiredFormats,
    requiredBreakpoints,
    maxWidth,
    params,
  };
}
