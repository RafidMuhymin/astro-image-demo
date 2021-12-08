import module from "module";
import getBreakpoints from "./getBreakpoints";
import getFallbackImage from "./getFallbackImage";
import stringifyParams from "./stringifyParams";

const { loadImage } = module.createRequire(import.meta.url)("imagetools-core");

export default async function getArtDirectedSources(
  artDirectives = [],
  placeholder,
  format,
  breakpoints,
  rest
) {
  const sources = [];
  const fallbacks = [];

  for (const { src, media } of artDirectives) {
    const image = loadImage("." + src);
    const { width: imageWidth, format: imageFormat } = await image.metadata();
    const requiredBreakpoints = getBreakpoints(breakpoints, imageWidth);
    const params = stringifyParams(rest);
    const formats = format.concat(imageFormat);

    for (const format of formats) {
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
