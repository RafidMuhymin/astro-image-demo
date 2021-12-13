import { loadImage } from "./imagetools-core";
import getConfigOptions from "./getConfigOptions";
import getFallbackImage from "./getFallbackImage";
import stringifyParams from "./stringifyParams";

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

  for (const {
    src,
    media,
    placeholder: directivePlaceholder,
    breakpoints: directiveBreakpoints,
    format: directiveFormat,
    fallbackFormat: directiveFallbackFormat,
    includeSourceFormat: directiveIncludeSourceFormat,
    formatOptions: directiveFormatOptions = {},
    ...configOptions
  } of artDirectives) {
    const image = loadImage("." + src);
    const { width: imageWidth, format: imageFormat } = await image.metadata();

    const { formats, requiredBreakpoints } = getConfigOptions(
      imageWidth,
      directiveBreakpoints || breakpoints,
      directiveFormat || format,
      imageFormat,
      directiveFallbackFormat || fallbackFormat,
      directiveIncludeSourceFormat || includeSourceFormat
    );

    for (const format of formats) {
      const params = stringifyParams({
        ...rest,
        ...configOptions,
        ...formatOptions[format],
        ...directiveFormatOptions[format],
      });

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
      src: await getFallbackImage(
        directivePlaceholder || placeholder,
        image,
        imageFormat,
        { ...formatOptions, ...directiveFormatOptions },
        rest
      ),
    });
  }

  return {
    sources,
    fallbacks,
  };
}
