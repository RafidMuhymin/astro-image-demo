import module from "module";
import crypto from "crypto";
import getFallbackImage from "./getFallbackImage";
import getBreakpoints from "./getBreakpoints";
import stringifyParams from "./stringifyParams";
import getArtDirectedSources from "./getArtDirectedSources";
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

export default async function (...args) {
  // Create sha256 hash of arguments
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(args))
    .digest("hex");

  // Check if image is already in cache
  if (optimizedImages.has(hash)) {
    return optimizedImages.get(hash);
  }

  let [src, format, breakpoints, placeholder, artDirectives, configOptions] =
    args;

  // Load the image
  const image = loadImage("." + src);

  const {
    width: imageWidth,
    height: imageHeight,
    format: imageFormat,
  } = await image.metadata();

  // If the format is set with a string, we need to convert it to an array
  Array.isArray(format) ? format : [format];

  // Add the original image format to the formats array
  const formats = format.concat(imageFormat);

  let { width, height, ...rest } = configOptions;
  let { aspect = imageWidth / imageHeight } = rest;

  // Calculate width if not provided when height is provided
  height && (width ||= Math.round(height * aspect));

  // Calculate height if not provided when width is provided
  width && (height ||= Math.round(width / aspect));

  // If width & height both are provided then aspectRatio is ignored and assigned their proportional value
  width && height && (aspect = width / height);

  // Stringify rest.aspect because the applyTransforms function requires it to be a string
  rest.aspect = aspect.toString();

  breakpoints = getBreakpoints(breakpoints, width || imageWidth);

  const maxWidth = breakpoints.at(-1);

  const sources = await Promise.all(
    formats.map(async (format) => {
      const params = stringifyParams(rest);

      // Generate the srcset
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
    height: Math.round(maxWidth / aspect),
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
