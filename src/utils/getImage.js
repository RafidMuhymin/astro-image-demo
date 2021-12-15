// @ts-check

import crypto from "crypto";
import getArtDirectedImages from "./getArtDirectedImages";
import getImageSources from "./getImageSources";
import getProcessedImage from "./getProcessedImage";

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

  const { sources, fallback } = await getImageSources(
    src,
    image,
    format,
    imageWidth,
    breakpoints,
    placeholder,
    imageFormat,
    fallbackFormat,
    formatOptions,
    includeSourceFormat,
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

  // @ts-ignore
  sources.unshift(...artDirectedImages.sources);

  const fallbacks = [...artDirectedImages.fallbacks, fallback].reverse();

  const imageData = {
    sources,
    fallbacks,
  };

  imagesData.set(hash, imageData);

  return imageData;
}
