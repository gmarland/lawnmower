import { 
    Group,
    Vector3
} from 'three';

import { Dimensions } from '../geometry/Dimensions';
import { SceneElementPlacement } from '../scene/SceneElementPlacement';

export interface SceneElement {
    getUUID(): string;

    getPlacementLocation(): SceneElementPlacement;

    getContent(): Promise<Group>;

    getPosition(): Promise<Vector3>;

    getDimensions(): Dimensions;
    
    getChildSceneElements(): Array<SceneElement>;

    getIsChildElement(uuid: string): boolean;
    
    getVisible(): boolean;

    setWidth(width: number): void;

    setCalculatedWidth(width: number): Promise<void>;

    setHidden(): void;
    
    setVisible(): void;

    addChildElement(position: number, childElement: SceneElement): void;

    isPartOfLayout(): boolean;

    isLayoutChild(layoutId): boolean;

    enableLayout(layoutId: string): void;

    disableLayouts(): void;

    draw(): Promise<void>;

    clicked(meshId: string): Promise<void>;

    update(delta: number): void;
}