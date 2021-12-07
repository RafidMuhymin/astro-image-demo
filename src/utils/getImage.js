import module from "module";
import crypto from "crypto";
import getFallbackImage from "./getFallbackImage";
import getBreakpoints from "./getBreakpoints";
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

  let [src, format, breakpoints, placeholder, artDirections, configOptions] =
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

  // Generate the required breakpoint widths
  const requiredBreakpoints = Array.isArray(breakpoints)
    ? breakpoints.sort((a, b) => a - b)
    : getBreakpoints(breakpoints, width || imageWidth);

  const maxWidth = requiredBreakpoints.at(-1);

  const sources = await Promise.all(
    formats.map(async (format) => {
      const keys = Object.keys(rest);

      // Generate the params string
      const params = keys.length
        ? keys
            .map((key) =>
              Array.isArray(rest[key])
                ? `&${key}=${rest[key].join(";")}`
                : `&${key}=${rest[key]}`
            )
            .join("")
        : "";

      // Generate the src using the last breakpoint
      const { default: imageSrc } = await import(
        `${src}?w=${maxWidth}&format=${format}${params}`
      );

      // Generate the srcset
      const { default: srcset } = await import(
        `${src}?srcset&w=${requiredBreakpoints.join(
          ";"
        )}&format=${format}${params}`
      );

      return {
        main: format === imageFormat ? true : false,
        format,
        src: imageSrc,
        srcset,
      };
    })
  );

  // Generate the fallback
  const fallback = await getFallbackImage(
    placeholder,
    image,
    imageFormat,
    rest
  );

  // Generate the sizes for browser
  const sizes = {
    width: maxWidth,
    height: Math.round(maxWidth / aspect),
  };

  const imageData = {
    sources,
    fallback,
    sizes,
  };

  // Add the image to the cache
  optimizedImages.set(hash, imageData);

  return imageData;
}
