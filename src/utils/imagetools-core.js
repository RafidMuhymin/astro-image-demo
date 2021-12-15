// @ts-check

import module from "module";

// @ts-ignore
const moduleRequire = module.createRequire(import.meta.url);

const { applyTransforms, builtins, generateTransforms, loadImage, parseURL } =
  moduleRequire("imagetools-core");

export { applyTransforms, builtins, generateTransforms, loadImage, parseURL };
