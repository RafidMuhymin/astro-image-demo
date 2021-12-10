import module from "module";
import crypto from "crypto";
import getFallbackImage from "./getFallbackImage";
import getBreakpoints from "./getBreakpoints";
import stringifyParams from "./stringifyParams";
import getArtDirectedSources from "./getArtDirectedSources";
// import astroConfig from "../../astro.config.mjs";

const moduleRequire = module.createRequire(import.meta.url);
const ImageTools = moduleRequire("imagetools-core");

const {
  loadImage,
  applyTransforms,
  generateTransforms,
  builtins,
  parseURL,
  resolveConfigs,
} = ImageTools;

const optimizedImages = new Map();

export default async function (
  src,
  format,
  breakpoints,
  placeholder,
  artDirectives,
  configOptions
) {
  // Create sha256 hash of arguments
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(arguments))
    .digest("hex");

  // Check if image is already in cache
  if (optimizedImages.has(hash)) {
    return optimizedImages.get(hash);
  }

  const { width, height, aspect, ...rest } = configOptions;

  // Load and resize the image if necessary
  const { image } = await applyTransforms(
    generateTransforms({ width, height, aspect }, builtins).transforms,
    loadImage("." + src)
  );

  const {
    width: imageWidth,
    height: imageHeight,
    format: imageFormat,
  } = await image.metadata();

  // Generate the required formats
  const formats = [...new Set([format, imageFormat].flat().filter(Boolean))];

  breakpoints = getBreakpoints(breakpoints, imageWidth);

  const maxWidth = breakpoints.at(-1);

  const sources = await Promise.all(
    formats.map(async (format) => {
      const params = stringifyParams(rest);

      const { default: srcset } = await import(
        `${src}?srcset&w=${breakpoints.join(";")}&format=${format}${params}`
      );

      return {
        format,
        src:
          format === imageFormat &&
          (await import(`${src}?w=${maxWidth}&format=${format}${params}`))
            .default,
        srcset,
      };
    })
  );

  // Generate Art Directed Images
  const artDirectedSources = await getArtDirectedSources(
    artDirectives,
    placeholder,
    format,
    breakpoints,
    rest
  );

  sources.unshift(...artDirectedSources.sources);

  // Generate fallback image
  const fallbackSrc = await getFallbackImage(
    placeholder,
    image,
    imageFormat,
    rest
  );

  const fallbacks = [...artDirectedSources.fallbacks, { src: fallbackSrc }];

  // Generate the sizes for browser
  const sizes = {
    width: maxWidth,
    height: Math.round(maxWidth / (aspect || imageWidth / imageHeight)),
  };

  const imageData = {
    sources,
    fallbacks,
    sizes,
  };

  // Add the image to the cache
  optimizedImages.set(hash, imageData);

  return imageData;
}
