import { BaseConfig } from "../BaseConfig";
import { TextAlignment } from "../constants/TextAlignment";

export interface LMTextConfig extends BaseConfig {
    width?: number;
    
    height?: number;

    borderRadius: number;

    textAlignment: TextAlignment;

    fontFamily: string;

    fontSize: number;

    fontColor: string;

    backgroundColor: string;

    padding?: number;

    italic: boolean;

    bold: boolean;
}