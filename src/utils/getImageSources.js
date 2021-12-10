import getFallbackImage from "./getFallbackImage";

export default async function getImageSources(
  src,
  image,
  placeholder,
  fallbackFormat,
  formats,
  requiredBreakpoints,
  maxWidth,
  params,
  rest
) {
  const { default: fallbackImageSource } = await import(
    `${src}?w=${maxWidth}&format=${fallbackFormat}${params}`
  );

  const sources = [];

  for (const format of formats) {
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
    rest
  );

  const fallback = { src: fallbackSrc };

  const imageSource = { sources, fallback };

  return imageSource;
}
