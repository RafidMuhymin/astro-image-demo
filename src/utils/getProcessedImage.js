// @ts-check

import fs from "fs";
import crypto from "crypto";
import {
  applyTransforms,
  builtins,
  generateTransforms,
  parseURL,
  loadImage,
} from "./imagetools-core";

export default async (src, configOptions) => {
  const { search, searchParams } = parseURL(src);
  const paramOptions = Object.fromEntries(searchParams);

  src = src.slice(0, src.lastIndexOf(search));
  configOptions = { ...paramOptions, ...configOptions };

  const { width, height, aspect, w, h, ar, ...rest } = configOptions;

  if (src.match("(http://|https://|data:image/).*")) {
    const hash = crypto.createHash("sha256").update(src).digest("hex");
    const directory = "node_modules/.cache";
    const filepath = `${directory}/${hash}.jpeg`;
    fs.existsSync(directory) || fs.mkdirSync(directory);
    fs.existsSync(filepath) ||
      fs.writeFileSync(
        filepath,
        Buffer.from(await (await fetch(src)).arrayBuffer())
      );
    src = `/${filepath}`;
  }

  const { image, metadata } = await applyTransforms(
    generateTransforms({ width, height, aspect, w, h, ar }, builtins)
      .transforms,
    loadImage(`.${src}`)
  );

  const {
    width: imageWidth,
    height: imageHeight,
    format: imageFormat,
  } = metadata;

  let path = src;

  return {
    path,
    rest,
    image,
    imageWidth,
    imageHeight,
    imageFormat,
  };
};
