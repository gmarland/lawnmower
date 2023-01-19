import { BaseConfig } from "../BaseConfig";

export interface LM360VideoConfig extends BaseConfig {
    vrEnabled: boolean;

    videoRadius: number;
    
    videoWidthSegments: number;

    videoHeightSegments: number;
}