import module from "module";

const moduleRequire = module.createRequire(import.meta.url);

const { applyTransforms, builtins, generateTransforms, loadImage } =
  moduleRequire("imagetools-core");

const sharp = moduleRequire("sharp");

export { sharp, applyTransforms, builtins, generateTransforms, loadImage };
