import { 
    Group,
    Vector3
} from 'three';

import { Dimensions } from '../geometry/Dimensions';
import { SceneElementPlacement } from '../scene/SceneElementPlacement';

export interface SceneElement {
    getUUID(): string;

    getPlacementLocation(): SceneElementPlacement;

    getPosition(): Vector3;

    getDimensions(): Dimensions;

    getCalculatedDimensions(): Dimensions;

    getChildSceneElements(): Array<SceneElement>;

    addChildElement(position: number, childElement: SceneElement): void;

    getContent(): Promise<Group>;

    setWidth(width: number): void;

    setCalculatedWidth(width: number): Promise<void>;

    setHidden(): void;
    
    setVisible(): void;

    clicked(meshId: string): Promise<void>;

    update(delta: number): void;
}