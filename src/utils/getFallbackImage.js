import util from "util";
import crypto from "crypto";
import potrace from "potrace";
import {
  applyTransforms,
  builtins,
  generateTransforms,
} from "./imagetools-core";

const getTracedSVG = async (image, { tracedSVG }) => {
  const traceSVG = util.promisify(potrace[tracedSVG.function]);
  const svg = await traceSVG(await image.toBuffer(), tracedSVG.options);
  return `data:image/svg+xml;utf8,${svg}`;
};

const getDominantColor = async (image) => {
  const { dominant } = await image.stats();
  const { r, g, b } = dominant;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" style="background: rgb(${r},${g},${b})"></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
};

const getBlurredFallback = async (image, format, formatOptions, rest) => {
  const { transforms } = generateTransforms(
    { width: 20, ...rest, ...formatOptions[format] },
    builtins
  );
  const { image: fallbackImage } = await applyTransforms(transforms, image);
  const fallbackImageBuffer = await fallbackImage.toBuffer();
  const fallbackImageBase64 = fallbackImageBuffer.toString("base64");
  const dataUri = `data:image/${format};base64,${fallbackImageBase64}`;
  return dataUri;
};

export default async function getFallbackImage(
  placeholder,
  image,
  format,
  formatOptions,
  rest
) {
  switch (placeholder) {
    case "blurred":
      return await getBlurredFallback(image, format, formatOptions, rest);
    case "tracedSVG":
      return await getTracedSVG(image, formatOptions);
    default:
      return await getDominantColor(image);
  }
}
