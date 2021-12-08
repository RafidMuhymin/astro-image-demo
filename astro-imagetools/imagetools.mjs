// @ts-check

import {
  applyTransforms,
  builtins,
  loadImage,
  generateTransforms,
} from "./imagetools-core.mjs";

/** @type {CreateConfig} */
export const createImageTools = () => {
  return {
    originalImages: new WeakMap(),
    modifiedImages: new WeakMap(),
    getImageByAsset(asset) {
      if (!this.originalImages.has(asset))
        this.originalImages.set(asset, loadImage(asset.pathname));

      return this.originalImages.get(asset);
    },
    getTransformedImageByAsset(asset) {
      if (!this.modifiedImages.has(asset)) {
        const image = this.getImageByAsset(asset);

        const { transforms } = generateTransforms(asset.params, builtins);

        this.modifiedImages.set(
          asset,
          applyTransforms(transforms, image.clone(), true)
        );
      }

      return this.modifiedImages.get(asset);
    },
    isImageExtension: RegExp.prototype.test.bind(
      /^(gif|jpeg|jpg|png|svg|webp)$/i
    ),
    isRasterImageExtension: RegExp.prototype.test.bind(
      /^(gif|jpeg|jpg|png|webp)$/i
    ),
    isVectorImageExtension: RegExp.prototype.test.bind(/^(svg)$/i),
    pipeAssetToResponse(asset, response) {
      return this.getTransformedImageByAsset(asset).then(
        ({ image, metadata }) => {
          response.setHeader("Content-Type", `image/${metadata.format}`);
          response.setHeader("Cache-Control", "max-age=360000");

          return image.clone().pipe(response);
        }
      );
    },
  };
};

// Exports

/** @typedef {{ (): Config }} CreateConfig */
/** @typedef {{ originalImages: WeakMap<Asset, OriginalImage>, modifiedImages: WeakMap<Asset, ModifiedImage>, getImageByAsset: GetImageByAsset, getTransformedImageByAsset: GetTransformedImageByAsset, isImageExtension(extension: string): boolean, isRasterImageExtension(extension: string): boolean, isVectorImageExtension(extension: string): boolean, pipeAssetToResponse: PipeAssetToResponse }} Config */

// Methods

/** @typedef {{ (asset: Asset): OriginalImage }} GetImageByAsset */
/** @typedef {{ (asset: Asset): ModifiedImage }} GetTransformedImageByAsset */
/** @typedef {{ (asset: Asset, response: ServerResponse): Promise<ServerResponse> }} PipeAssetToResponse */

// Interfaces

/** @typedef {import('./context.js').Asset} Asset */
/** @typedef {Record<string, unknown>} Metadata */
/** @typedef {import('sharp').Sharp} OriginalImage */
/** @typedef {Promise<{ image: OriginalImage, metadata: Metadata }>} ModifiedImage */
/** @typedef {import('http').ServerResponse} ServerResponse */
