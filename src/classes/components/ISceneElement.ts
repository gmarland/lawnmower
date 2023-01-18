import { 
    Group,
    Vector3
} from 'three';

import { Dimensions } from '../geometry/Dimensions';

import { SceneElementPlacement } from '../scene/SceneElementPlacement';

export interface ISceneElement {
    id: string;

    position: Vector3;

    uuid: string;

    dynamicWidth: boolean;

    width: number;

    visible: boolean;

    placementLocation: SceneElementPlacement;

    getContent(): Promise<Group>;

    getPosition(): Promise<Vector3>;

    dimensions: Dimensions;
    
    getChildSceneElements(): Array<ISceneElement>;

    getIsChildElement(uuid: string): boolean;

    addChildElement(position: number, childElement: ISceneElement): Promise<void>;

    removeChildElement(childElement: ISceneElement): Promise<void>;

    isPartOfLayout(): boolean;

    isLayoutChild(layoutId): boolean;

    enableLayout(layoutId: string): Promise<void>;

    disableLayouts(): Promise<void>;

    draw(): Promise<boolean>; // draw updated dimensions

    drawParent(): Promise<void>;

    clicked(meshId: string): Promise<void>;

    update(delta: number): void;

    destroy(): Promise<void>;
}