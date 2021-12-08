// @ts-check

import { createContext } from "./context.mjs";
import { createImageTools } from "./imagetools.mjs";

/** @type {PluginCreator} */
export const imagetools = () => {
  const context = createContext();
  const images = createImageTools();

  return {
    name: "astro-imagetools",
    enforce: "pre",
    configResolved(config) {
      context.configResolved(config);
    },
    load(id) {
      const info = context.getInfo(id);

      if (images.isImageExtension(info.extension)) {
        return context.defineAsset(info.pathname, info.params).toExportString();
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const asset = context.getAssetByURL(req.url);

        if (asset) {
          return images.pipeAssetToResponse(asset, res);
        }

        next();
      });
    },
    async generateBundle(_options, bundle) {
      for (const [pathname, asset] of context.assets) {
        for (const [_chunkId, output] of Object.entries(bundle)) {
          if (typeof output.source === "string") {
            const modifiedImage = await images.getTransformedImageByAsset(
              asset
            );
            const emittedName =
              asset.basename.replace(/\.[a-z0-9]+$/g, "") +
              `.${modifiedImage.metadata.format.replace(/\+.*$/, "")}`;

            const fileName = this.getFileName(
              this.emitFile({
                name: emittedName,
                type: "asset",
                source: await modifiedImage.image.toBuffer(),
              })
            );

            if (typeof output.source === "string") {
              output.source = output.source.replace(pathname, fileName);
            }
          }
        }
      }
    },
  };
};

// Exports

/** @typedef {{ (): Plugin }} PluginCreator */
/** @typedef {Omit<import('vite').Plugin, 'generateBundle'> & { generateBundle: GenerateBundle }} Plugin */
/** @typedef {{ (this: import('rollup').PluginContext, options: import('rollup').NormalizedOutputOptions, bundle: OutputBundle, isWrite: boolean): void }} GenerateBundle */

// Interfaces

/** @typedef {{ [fileName: string]: import('rollup').EmittedAsset }} OutputBundle */
