// @ts-check

import getConfigOptions from "./getConfigOptions";
import getFallbackImage from "./getFallbackImage";
import stringifyParams from "./stringifyParams";
import getProcessedImage from "./getProcessedImage";

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
  const images = [];

  for (const {
    src,
    media,
    placeholder: directivePlaceholder,
    breakpoints: directiveBreakpoints,
    objectFit,
    objectPosition,
    format: directiveFormat,
    fallbackFormat: directiveFallbackFormat,
    includeSourceFormat: directiveIncludeSourceFormat,
    formatOptions: directiveFormatOptions = {},
    ...configOptions
  } of artDirectives) {
    const {
      path,
      rest: rest2,
      image,
      imageWidth,
      imageHeight,
      imageFormat,
    } = await getProcessedImage(src, configOptions);

    rest2.aspect = `${imageWidth / imageHeight}`;

    const { formats, requiredBreakpoints } = getConfigOptions(
      imageWidth,
      directiveBreakpoints || breakpoints,
      directiveFormat || format,
      imageFormat,
      directiveFallbackFormat || fallbackFormat,
      directiveIncludeSourceFormat || includeSourceFormat
    );

    const maxWidth = requiredBreakpoints.at(-1);

    const sources = [];

    for (const format of formats) {
      const params = stringifyParams({
        ...rest,
        ...rest2,
        ...formatOptions[format],
        ...directiveFormatOptions[format],
      });

      const { default: srcset } = await import(
        `${path}?srcset&w=${requiredBreakpoints.join(
          ";"
        )}&format=${format}${params}`
      );

      sources.push({
        format,
        srcset,
      });
    }

    const sizes = {
      width: maxWidth,
      height: Math.round(maxWidth / rest2.aspect),
    };

    const object = {
      fit: objectFit,
      position: objectPosition,
    };

    const fallback = await getFallbackImage(
      directivePlaceholder || placeholder,
      image,
      imageFormat,
      { ...formatOptions, ...directiveFormatOptions },
      { ...rest, ...rest2 }
    );

    images.push({
      media,
      sources,
      sizes,
      object,
      fallback,
    });
  }

  return images;
}
