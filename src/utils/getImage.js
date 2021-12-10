import crypto from "crypto";
import {
  applyTransforms,
  builtins,
  generateTransforms,
  loadImage,
} from "./imagetools-core";
import getArtDirectedImages from "./getArtDirectedImages";
import getConfigOptions from "./getConfigOptions";
import getImageSources from "./getImageSources";

const imagesData = new Map();

export default async function (
  src,
  format,
  breakpoints,
  placeholder,
  artDirectives,
  fallbackFormat,
  includeSourceFormat,
  configOptions
) {
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(arguments))
    .digest("hex");

  if (imagesData.has(hash)) {
    return imagesData.get(hash);
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

  fallbackFormat ||= imageFormat;

  const { formats, requiredBreakpoints, maxWidth, params } = getConfigOptions(
    imageWidth,
    breakpoints,
    format,
    imageFormat,
    fallbackFormat,
    includeSourceFormat,
    rest
  );

  const { sources, fallback } = await getImageSources(
    src,
    image,
    placeholder,
    fallbackFormat,
    formats,
    requiredBreakpoints,
    maxWidth,
    params,
    rest
  );

  const artDirectedImages = await getArtDirectedImages(
    artDirectives,
    placeholder,
    format,
    breakpoints,
    fallbackFormat,
    includeSourceFormat,
    rest
  );

  sources.unshift(...artDirectedImages.sources);

  const fallbacks = [...artDirectedImages.fallbacks, fallback];

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

  imagesData.set(hash, imageData);

  return imageData;
}
