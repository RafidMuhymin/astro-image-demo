declare type format =
  | "heic"
  | "heif"
  | "avif"
  | "jpg"
  | "jpeg"
  | "png"
  | "tiff"
  | "webp"
  | "gif";

declare interface ComponentProps {
  src: string;
  alt: string;
  caption?: string;
  preload?: boolean | format;
  loading?: "lazy" | "eager" | "auto" | null;
  decoding?: "async" | "sync" | "auto" | null;
  breakpoints?:
    | number[]
    | {
        count?: number;
        minWidth?: number;
        maxWidth?: number;
      };
  objectFit?: "fill" | "contain" | "cover" | "none" | "scale-down";
  objectPosition?: string;
  layout?: "constrained" | "fixed" | "full";
  placeholder?: "dominantColor" | "blurred" | "tracedSVG" | "none";
  artDirectives?: ({
    src: string;
    media: string;
    breakpoints?: number | number[];
    placeholder?: "dominantColor" | "blurred" | "tracedSVG" | "none";
  } & ImageToolsConfigs)[];
}

declare interface ImageToolsConfigs {
  format?: format | format[];
  flip?: boolean;
  flop?: boolean;
  invert?: boolean;
  flatten?: boolean;
  normalize?: boolean;
  grayscale?: boolean;
  width?: number;
  height?: number;
  aspect?: number;
  hue?: number;
  saturation?: number;
  brightness?: number;
  background?: string;
  tint?: string;
  blur?: number | boolean;
  median?: number | boolean;
  rotate?: number | number[];
  quality?: number | number[];
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  kernel?: "nearest" | "cubic" | "mitchell" | "lanczos2" | "lanczos3";
  position?:
    | "top"
    | "right top"
    | "right"
    | "right bottom"
    | "bottom"
    | "left bottom"
    | "left"
    | "left top"
    | "north"
    | "northeast"
    | "east"
    | "southeast"
    | "south"
    | "southwest"
    | "west"
    | "northwest"
    | "center"
    | "centre"
    | "cover"
    | "entropy"
    | "attention";
}

export default interface ImageConfig
  extends ComponentProps,
    ImageToolsConfigs {}
