import { 
    Group,
    Vector3
} from 'three';

import { Dimensions } from '../geometry/Dimensions';
import { SceneElementPlacement } from '../scene/SceneElementPlacement';

export interface SceneElement {
    uuid: string;

    width: number;

    getPlacementLocation(): SceneElementPlacement;

    getContent(): Promise<Group>;

    getPosition(): Promise<Vector3>;

    getDimensions(): Dimensions;
    
    getChildSceneElements(): Array<SceneElement>;

    getIsChildElement(uuid: string): boolean;
    
    getVisible(): boolean;

    setHidden(): void;
    
    setVisible(): void;

    addChildElement(position: number, childElement: SceneElement): void;

    isPartOfLayout(): boolean;

    isLayoutChild(layoutId): boolean;

    enableLayout(layoutId: string): Promise<void>;

    disableLayouts(): Promise<void>;

    draw(): Promise<void>;

    clicked(meshId: string): Promise<void>;

    update(delta: number): void;
}