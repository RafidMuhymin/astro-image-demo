import { loadImage } from "./imagetools-core";
import getConfigOptions from "./getConfigOptions";
import getFallbackImage from "./getFallbackImage";

export default async function getArtDirectedImages(
  artDirectives = [],
  placeholder,
  format,
  breakpoints,
  fallbackFormat,
  includeSourceFormat,
  formatOptions,
  rest
) {
  const sources = [];
  const fallbacks = [];

  for (const { src, media } of artDirectives) {
    const image = loadImage("." + src);
    const { width: imageWidth, format: imageFormat } = await image.metadata();

    const { formats, requiredBreakpoints } = getConfigOptions(
      imageWidth,
      breakpoints,
      format,
      imageFormat,
      fallbackFormat,
      includeSourceFormat,
      formatOptions,
      rest
    );

    for (const format of formats) {
      const params = { ...rest, ...formatOptions[format] };
      const { default: srcset } = await import(
        `${src}?srcset&w=${requiredBreakpoints.join(
          ";"
        )}&format=${format}${params}`
      );
      sources.push({
        media,
        format,
        srcset,
      });
    }

    fallbacks.push({
      media,
      src: await getFallbackImage(placeholder, image, imageFormat, rest),
    });
  }

  return {
    sources,
    fallbacks,
  };
}
