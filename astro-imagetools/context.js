import { createHash } from "crypto";
import { posix as ps } from "path";

export const Asset = class Asset {
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
