import crypto from "crypto";
import getArtDirectedImages from "./getArtDirectedImages";
import getConfigOptions from "./getConfigOptions";
import getImageSources from "./getImageSources";
import getProcessedImage from "./getProcessedImage";
import { parseURL } from "./imagetools-core";

const imagesData = new Map();

export default async function (
  src,
  format,
  breakpoints,
  placeholder,
  artDirectives,
  fallbackFormat,
  includeSourceFormat,
  formatOptions,
  configOptions
) {
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(arguments))
    .digest("hex");

  if (imagesData.has(hash)) {
    return imagesData.get(hash);
  }

  const { path, rest, image, imageWidth, imageHeight, imageFormat } =
    await getProcessedImage(src, configOptions);

  src = path;
  rest.aspect = `${imageWidth / imageHeight}`;

  fallbackFormat ||= imageFormat;

  const { formats, requiredBreakpoints } = getConfigOptions(
    imageWidth,
    breakpoints,
    format,
    imageFormat,
    fallbackFormat,
    includeSourceFormat
  );

  const maxWidth = requiredBreakpoints.at(-1);

  const { sources, fallback } = await getImageSources(
    src,
    image,
    placeholder,
    fallbackFormat,
    formats,
    requiredBreakpoints,
    maxWidth,
    formatOptions,
    rest
  );

  const artDirectedImages = await getArtDirectedImages(
    artDirectives,
    placeholder,
    format,
    breakpoints,
    fallbackFormat,
    includeSourceFormat,
    formatOptions,
    rest
  );

  sources.unshift(...artDirectedImages.sources);

  const fallbacks = [...artDirectedImages.fallbacks, fallback];

  // Generate the sizes for browser
  const sizes = {
    width: maxWidth,
    height: Math.round(maxWidth / rest.aspect),
  };

  const imageData = {
    sources,
    fallbacks,
    sizes,
  };

  imagesData.set(hash, imageData);

  return imageData;
}
