import {
  applyTransforms as coreApplyTransforms,
  loadImage as coreLoadImage,
} from "imagetools-core";
import fs from "fs";
import stream from "stream";
export { builtins, generateTransforms } from "imagetools-core";

const fauxLoadImage = (pathname) => {
  const readStream = fs.createReadStream(pathname);

  const patch = (readStream) => {
    const patched = {
      faux: true,
      format: "svg+xml",
      toBuffer() {
        return fs.readFileSync(pathname);
      },
      clone() {
        return patched;
      },
      pipe(...args) {
        return fs.createReadStream(pathname).pipe(...args);
      },
    };

    return patched;
  };

  return patch(readStream);
};

function stream2buffer(stream) {
  return new Promise((resolve, reject) => {
    const _buf = [];

    stream.on("data", (chunk) => _buf.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(_buf)));
    stream.on("error", (err) => reject(err));
  });
}

/** @type {import('imagetools-core').loadImage} */
export const loadImage = (pathname) => {
  return /\.svg$/.test(pathname)
    ? fauxLoadImage(pathname)
    : coreLoadImage(pathname);
};

const fauxApplyTransforms = (_transforms, image, _minify) =>
  Promise.resolve({ image, metadata: { format: image.format } });

/** @type {import('imagetools-core').applyTransforms} */
export const applyTransforms = (transforms, image, minify) => {
  return image.faux
    ? fauxApplyTransforms(transforms, image, minify)
    : coreApplyTransforms(transforms, image, minify);
};

// @ts-check

import { createHash } from "crypto";
import { posix as ps } from "path";

/** @type {{ new (pathname: string, id: number, params?: Params): Asset }} */
export const Asset = class Asset {
  /** @this {Asset} @param {string} pathname @param {number} id @param {Params} [params] */
  constructor(pathname, id, params) {
    this.params = Object(params);
    this.pathname = pathname;
    this.basename = ps.basename(pathname);
    this.extension = ps.extname(pathname).slice(1);

    this.id = `/@assets/${this.basename.replace(
      /\.[a-z0-9]+$/g,
      ""
    )}.${createHash("md5")
      .update(this.pathname)
      .digest("hex")
      .substring(0, 5)}`;
  }

  toExportString() {
    return `export default "${this.id}"`;
  }
};

/** @type {CreateConfig} */
export const createContext = () => {
  return {
    assets: new Map(),
    config: null,
    env: { PROD: true },
    id: 0,
    outputOptions: { dir: "." },
    root: ".",
    configResolved(resolvedConfig) {
      this.config = resolvedConfig;
      this.env = resolvedConfig.env;
      this.outputOptions = Array.isArray(
        resolvedConfig.build.rollupOptions.output
      )
        ? resolvedConfig.build.rollupOptions.output[0]
        : resolvedConfig.build.rollupOptions.output || {};
      this.root = resolvedConfig.root || ".";
    },
    defineAsset(pathname, params) {
      const asset = new Asset(pathname, ++this.id, params);

      this.assets.set(asset.id, asset);

      return asset;
    },
    getAssetByURL(url) {
      return this.assets.get(url);
    },
    getInfo(id) {
      const index = id.indexOf("?");
      const hasIndex = index > -1;
      const pathname = hasIndex ? id.slice(0, index) : id;
      const basename = ps.basename(pathname);
      const extension = ps.extname(pathname).slice(1);
      const params = hasIndex
        ? Object.fromEntries(new URLSearchParams(id.slice(index)))
        : {};

      return { pathname, params, extension, basename };
    },
  };
};

// Exports

/** @typedef {{ (): Config }} CreateConfig */
/** @typedef {{ assets: Assets, config: ResolvedConfig, configResolved: ConfigResolved, defineAsset: DefineAsset, env: Env, id: number, getAssetByURL: GetAssetByURL, getInfo: GetInfo, outputOptions: OutputOptions, root: string }} Config */

// Methods

/** @typedef {{ (config: ResolvedConfig): void }} ConfigResolved */
/** @typedef {{ (pathname: string, params?: Params): Asset }} DefineAsset */
/** @typedef {{ (url: string): Asset | null }} GetAssetByURL*/
/** @typedef {{ (id: string): Details }} GetInfo */

// Interfaces

/** @typedef {{ id: string, pathname: string, params: Params, basename: string, extension: string, toExportString(): string }} Asset */
/** @typedef {Map<string, Asset>} Assets */
/** @typedef {{ pathname: string, params: Params, extension: string, basename: string }} Details */
/** @typedef {import('rollup').OutputOptions} OutputOptions */
/** @typedef {import('vite').ResolvedConfig} ResolvedConfig */
/** @typedef {Record<string, boolean>} Env */
/** @typedef {Record<string, string>} Params */
