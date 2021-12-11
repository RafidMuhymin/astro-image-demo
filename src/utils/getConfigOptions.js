import getBreakpoints from "./getBreakpoints";
import stringifyParams from "./stringifyParams";

export default function getConfigOptions(
  imageWidth,
  breakpoints,
  format,
  imageFormat,
  fallbackFormat,
  includeSourceFormat,
  rest
) {
  const formats = [
    ...new Set(
      [format, includeSourceFormat && imageFormat]
        .flat()
        .filter((f) => f && f !== fallbackFormat)
    ),
    fallbackFormat,
  ];

  const requiredBreakpoints = getBreakpoints(breakpoints, imageWidth);

  const maxWidth = requiredBreakpoints.at(-1);

  const params = stringifyParams(rest);

  return {
    formats,
    requiredBreakpoints,
    maxWidth,
    params,
  };
}
