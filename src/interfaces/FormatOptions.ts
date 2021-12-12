import { ImageToolsConfigs } from "./ImagetoolsConfig";

export type format =
  | "heic"
  | "heif"
  | "avif"
  | "jpg"
  | "jpeg"
  | "png"
  | "tiff"
  | "webp"
  | "gif";

declare interface SharedTracingOptions {
  turnPolicy?: "black" | "white" | "left" | "right" | "minority" | "majority";
  turdSize?: number;
  alphaMax?: number;
  optCurve?: boolean;
  optTolerance?: number;
  threshold?: number;
  blackOnWhite?: boolean;
  color?: "auto" | string;
  background?: "transparent" | string;
}

declare interface TraceOptions {
  function?: "trace";
  options?: SharedTracingOptions;
}

declare interface PosterizeOptions {
  function?: "posterize";
  options?: SharedTracingOptions & {
    fill?: "spread" | "dominant" | "median" | "mean";
    ranges?: "auto" | "equal";
    steps?: number | number[];
  };
}

declare type PotraceOptions = TraceOptions | PosterizeOptions;

export interface FormatOptions {
  format?: format | format[] | [] | null;
  fallbackFormat?: boolean;
  includeSourceFormat?: boolean;
  formatOptions?: {
    [key in format]?: ImageToolsConfigs;
  } & {
    tracedSVG?: PotraceOptions;
  };
}
