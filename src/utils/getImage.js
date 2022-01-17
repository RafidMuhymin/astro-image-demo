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
  configOptions,
  globalConfigOptions
) {
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(arguments))
    .digest("hex");

  if (imagesData.has(hash)) {
    return imagesData.get(hash);
  }

  const { path, rest, image, imageWidth, imageHeight, imageFormat } =
    await getProcessedImage(src, configOptions, globalConfigOptions);

  src = path;
  rest.aspect = `${imageWidth / imageHeight}`;
  fallbackFormat ||= imageFormat;

  const mainImage = await getImageSources(
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

  const images = [...artDirectedImages, mainImage];

  imagesData.set(hash, images);

  return images;
}
