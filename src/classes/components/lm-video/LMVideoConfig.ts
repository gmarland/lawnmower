import { BaseConfig } from "../BaseConfig";

export interface LMVideoConfig extends BaseConfig {
    placeholderTimestamp: number;

    width: number;
    
    height: number;

    playInline: boolean;
}