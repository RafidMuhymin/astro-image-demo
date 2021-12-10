import module from "module";

const { applyTransforms, builtins, generateTransforms, loadImage } =
  module.createRequire(import.meta.url)("imagetools-core");

export { applyTransforms, builtins, generateTransforms, loadImage };
