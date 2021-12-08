// @ts-check
import module from "module";
import getBreakpoints from "./getBreakpoints";
import getFallbackImage from "./getFallbackImage";
import stringifyParams from "./stringifyParams";

// @ts-ignore
const { loadImage } = module.createRequire(import.meta.url)("imagetools-core");

export default async function getArtDirectedSources(
  artDirections = [],
  placeholder,
  format,
  breakpoints,
  rest
) {
  const sourcesAndFallbacks = await Promise.all(
    artDirections.map(async ({ src, media }) => {
      const image = loadImage("." + src);
      const { width: imageWidth, format: imageFormat } = await image.metadata();
      const requiredBreakpoints = getBreakpoints(breakpoints, imageWidth);
      const params = stringifyParams(rest);
      const formats = format.concat(imageFormat);

      const sources = await Promise.all(
        formats.map(async (format) => {
          const { default: srcset } = await import(
            `${src}?srcset&w=${requiredBreakpoints.join(
              ";"
            )}&format=${format}${params}`
          );
          return {
            media,
            format,
            srcset,
          };
        })
      );

      const fallbackImage = await getFallbackImage(
        placeholder,
        image,
        imageFormat,
        rest
      );

      const fallback = {
        media,
        image: fallbackImage,
      };

      return {
        sources,
        fallback,
      };
    })
  );

  const sources = sourcesAndFallbacks.map(({ sources }) => sources).flat();
  const fallbacks = sourcesAndFallbacks.map(({ fallback }) => fallback);

  return {
    sources,
    fallbacks,
  };
}
