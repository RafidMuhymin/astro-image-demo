import module from "module";

const moduleRequire = module.createRequire(import.meta.url);

const { applyTransforms, builtins, generateTransforms, loadImage, parseURL } =
  moduleRequire("imagetools-core");

const sharp = moduleRequire("sharp");

export {
  applyTransforms,
  builtins,
  generateTransforms,
  loadImage,
  parseURL,
  sharp,
};
