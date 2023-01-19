import { BaseConfig } from "../BaseConfig";

export interface LMVideoControlsConfig extends BaseConfig {
    vrEnabled: boolean;

    baseImagePath: string;

    x: number;
    
    y: number;
    
    z: number;
    
    width: number;

    height: number;

    backgroundColor: string;
}