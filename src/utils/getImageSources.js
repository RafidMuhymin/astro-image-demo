// @ts-check

import getConfigOptions from "./getConfigOptions";
import getFallbackImage from "./getFallbackImage";
import stringifyParams from "./stringifyParams";

export default async function getImageSources(
  src,
  image,
  format,
  imageWidth,
  breakpoints,
  placeholder,
  imageFormat,
  fallbackFormat,
  formatOptions,
  includeSourceFormat,
  rest
) {
  const { formats, requiredBreakpoints } = getConfigOptions(
    imageWidth,
    breakpoints,
    format,
    imageFormat,
    fallbackFormat,
    includeSourceFormat
  );

  const maxWidth = requiredBreakpoints.at(-1);

  const params = stringifyParams({ ...rest, ...formatOptions[fallbackFormat] });

  const { default: fallbackImageSource } = await import(
    `${src}?w=${maxWidth}&format=${fallbackFormat}${params}`
  );

  const sources = [];

  for (const format of formats) {
    const params = stringifyParams({ ...rest, ...formatOptions[format] });
    const { default: srcset } = await import(
      `${src}?srcset&w=${requiredBreakpoints.join(
        ";"
      )}&format=${format}${params}`
    );

    const sizes = {
      width: maxWidth,
      height: Math.round(maxWidth / rest.aspect),
    };

    sources.push({
      src: format === fallbackFormat && fallbackImageSource,
      format,
      srcset,
      sizes,
    });
  }

  const fallbackSrc = await getFallbackImage(
    placeholder,
    image,
    fallbackFormat,
    formatOptions,
    rest
  );

  const fallback = { src: fallbackSrc };

  const imageSource = { sources, fallback };

  return imageSource;
}
