import { BaseConfig } from "../BaseConfig";

export interface LMModalConfig extends BaseConfig {
    baseImagePath: string;

    width: number;
    
    height: number;

    offset: number;

    padding: number;

    borderRadius: number;

    backgroundColor: string;

    borderColor: string;

    borderWidth: number;
    
    closeButtonWidth: number;
}