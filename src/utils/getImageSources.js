import getFallbackImage from "./getFallbackImage";
import stringifyParams from "./stringifyParams";

export default async function getImageSources(
  src,
  image,
  placeholder,
  fallbackFormat,
  formats,
  requiredBreakpoints,
  maxWidth,
  formatOptions,
  rest
) {
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

    sources.push({
      src: format === fallbackFormat && fallbackImageSource,
      format,
      srcset,
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
