import { 
    Group,
    Vector3
} from 'three';

import { Dimensions } from '../geometry/Dimensions';
import { SceneElementPlacement } from '../scene/SceneElementPlacement';

export interface SceneElement {
    id: string;

    dynamicWidth: boolean;

    width: number;

    visible: boolean;

    getPlacementLocation(): SceneElementPlacement;

    getContent(): Promise<Group>;

    getPosition(): Promise<Vector3>;

    getDimensions(): Dimensions;
    
    getChildSceneElements(): Array<SceneElement>;

    getIsChildElement(uuid: string): boolean;

    addChildElement(position: number, childElement: SceneElement): Promise<void>;

    isPartOfLayout(): boolean;

    isLayoutChild(layoutId): boolean;

    enableLayout(layoutId: string): Promise<void>;

    disableLayouts(): Promise<void>;

    draw(): Promise<boolean>; // draw updated dimensions

    drawParent(): Promise<void>;

    clicked(meshId: string): Promise<void>;

    update(delta: number): void;
}