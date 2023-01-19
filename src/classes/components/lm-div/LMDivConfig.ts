import { HorizontalAlign } from "../../geometry/HorizontalAlign";
import { ItemHorizontalAlign } from "../../geometry/ItemHorizontalAlign";
import { ItemVerticalAlign } from "../../geometry/ItemVerticalAlign";
import { VerticalAlign } from "../../geometry/VerticalAlign";
import { BaseConfig } from "../BaseConfig";

export interface LMDivConfig extends BaseConfig {  
    verticalAlign: VerticalAlign;

    horizontalAlign: HorizontalAlign;

    itemVerticalAlign: ItemVerticalAlign;

    itemHorizontalAlign: ItemHorizontalAlign;

    width: number;
    
    height?: number;

    borderRadius: number;

    backgroundColor: string;

    opacity?: number;

    padding?: number;

    margin?: number;

    xRotation: number;

    yRotation: number;
    
    zRotation: number;
}