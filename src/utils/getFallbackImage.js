import module from "module";
import util from "util";
import potrace from "potrace";

const moduleRequire = module.createRequire(import.meta.url);
const { generateTransforms, applyTransforms, builtins } =
  moduleRequire("imagetools-core");

const getDominantColor = async (image) => {
  const { dominant } = await image.stats();
  const { r, g, b } = dominant;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" style="background: rgb(${r},${g},${b})"></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
};

const getTracedSVG = async (image) => {
  const traceSVG = util.promisify(potrace.trace);
  const svg = await traceSVG(await image.toBuffer());
  return `data:image/svg+xml;utf8,${svg}`;
};

const getBlurredFallback = async (image, format, rest) => {
  const { transforms } = generateTransforms({ width: 20, ...rest }, builtins);
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
  rest
) {
  switch (placeholder) {
    case "blurred":
      return await getBlurredFallback(image, format, rest);
    case "tracedSVG":
      return await getTracedSVG(image);
    default:
      return await getDominantColor(image);
  }
}
