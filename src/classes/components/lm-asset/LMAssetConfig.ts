import { BaseConfig } from "../BaseConfig";

export interface LMAssetConfig extends BaseConfig {
    activeAnimation: string;
    
    radius: number;

    xRotation: number;
    yRotation: number;
    zRotation: number;

    xRotationSpeed: number;
    yRotationSpeed: number;
    zRotationSpeed: number;
}