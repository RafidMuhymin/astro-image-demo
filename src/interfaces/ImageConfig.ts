import type { ImageToolsConfigs } from "./ImagetoolsConfig";
import type { FormatOptions } from "./FormatOptions";
import type { ComponentProps } from "./ComponentProps";

declare type ImageConfig = ComponentProps & FormatOptions & ImageToolsConfigs;

export default ImageConfig;
