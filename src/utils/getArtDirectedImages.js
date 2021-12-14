// @ts-check

import {
  applyTransforms,
  builtins,
  generateTransforms,
  loadImage,
} from "./imagetools-core";
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
    const { width, height, aspect, ...rest2 } = configOptions;

    const { image, metadata } = await applyTransforms(
      generateTransforms({ width, height, aspect }, builtins).transforms,
      loadImage("." + src)
    );

    const {
      width: imageWidth,
      height: imageHeight,
      format: imageFormat,
    } = await metadata;

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

    for (const format of formats) {
      const params = stringifyParams({
        ...rest,
        ...rest2,
        ...formatOptions[format],
        ...directiveFormatOptions[format],
      });

      const { default: srcset } = await import(
        `${src}?srcset&w=${requiredBreakpoints.join(
          ";"
        )}&format=${format}${params}`
      );

      const sizes = {
        width: maxWidth,
        height: Math.round(maxWidth / rest2.aspect),
      };

      sources.push({
        media,
        format,
        srcset,
        sizes,
      });
    }

    fallbacks.push({
      media,
      src: await getFallbackImage(
        directivePlaceholder || placeholder,
        image,
        imageFormat,
        { ...formatOptions, ...directiveFormatOptions },
        { ...rest, ...rest2 }
      ),
    });
  }

  return {
    sources,
    fallbacks,
  };
}
