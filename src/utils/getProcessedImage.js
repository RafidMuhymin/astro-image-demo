// @ts-check
import fs from "fs";
import crypto from "crypto";
import {
  applyTransforms,
  builtins,
  generateTransforms,
  sharp,
} from "./imagetools-core";

export default async (src, width, height, aspect, w, h, ar) => {
  let imageBuffer, filepath;

  if (src.match("(http://|https://|data:).*")) {
    const hash = crypto.createHash("sha256").update(src).digest("hex");
    const directory = "node_modules/.cache";
    filepath = `${directory}/${hash}`;
    fs.existsSync(directory) || fs.mkdirSync(directory);
    fs.existsSync(filepath) ||
      fs.writeFileSync(
        filepath,
        Buffer.from(await (await fetch(src)).arrayBuffer())
      );
    imageBuffer = fs.readFileSync(filepath);
  }

  const { image, metadata } = await applyTransforms(
    generateTransforms({ width, height, aspect, w, h, ar }, builtins)
      .transforms,
    await sharp(imageBuffer || `.${src}`)
  );

  const {
    width: imageWidth,
    height: imageHeight,
    format: imageFormat,
  } = metadata;

  let path = src;

  if (imageBuffer) {
    const newFilepath = `${filepath}.${imageFormat}`;
    fs.existsSync(newFilepath) || fs.writeFileSync(newFilepath, imageBuffer);
    path = `/${newFilepath}`;
  }

  return {
    path,
    image,
    imageWidth,
    imageHeight,
    imageFormat,
  };
};
