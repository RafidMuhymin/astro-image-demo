import type { ImageToolsConfigs } from "./ImagetoolsConfig";
import type { format, FormatOptions } from "./FormatOptions";

declare interface ArtDirectives extends FormatOptions, ImageToolsConfigs {
  src: string;
  media: string;
  breakpoints?: number | number[];
  placeholder?: "dominantColor" | "blurred" | "tracedSVG" | "none";
  objectFit?: "fill" | "contain" | "cover" | "none" | "scale-down";
  objectPosition?: string;
}

export interface ComponentProps {
  src: string;
  alt: string;
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
  layout?: "constrained" | "fixed" | "fullWidth" | "fill";
  placeholder?: "dominantColor" | "blurred" | "tracedSVG" | "none";
  artDirectives?: ArtDirectives[];
}
