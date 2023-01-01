import { 
    Group,
    Vector3
} from 'three';

import { Dimensions } from '../../geometry/Dimensions';

import { MeshUtils } from "../../geometry/MeshUtils";
import { MainScene } from '../../scene/MainScene';
import { SceneElementPlacement } from '../../scene/SceneElementPlacement';
import { SceneElement } from '../SceneElement';

export class VRLayout implements SceneElement {
    private _parent: SceneElement;

    private _id: string;

    private _uuid: string;

    private _content?: Group = new Group();
    private _initialized: boolean = false;

    private _childElements: Map<number, SceneElement> = new Map<number, SceneElement>();

    constructor(parent: SceneElement, id: string) {
        this._parent = parent;

        this._id = id;
        
        this._uuid = MeshUtils.generateId();
        
        this._content.name = "layout";
        this._content.visible = false;
    }

    ////////// Getters

    public getUUID(): string {
        return this._uuid
    }

    public getId() {
        return this._id;
    }

    public getPlacementLocation(): SceneElementPlacement {
        return SceneElementPlacement.Main;
    }

    public getDimensions(): Dimensions {
        return {
            width: 0,
            height: 0
        }
    }
    
    public async getPosition(): Promise<Vector3> {
        return new Promise(async (resolve) => {
            if (!this._initialized) await this.draw(); 
    
            resolve(this._content.position);
        });
    }

    public getChildSceneElements(): SceneElement[] {
        let keys = Array.from(this._childElements.keys());
        keys.sort(function(a, b){return a-b});

        const elements = [];
        
        for (let i=0; i< keys.length; i++) {
            elements.push(this._childElements.get(keys[i])); 
        }

        return elements;
    }

    public getIsChildElement(uuid: string): boolean {
        if (uuid === this._uuid) {
            return true;
        }
        else {
            let sceneElements = this.getChildSceneElements();
            
            for (let i=0; i< sceneElements.length; i++) {
                if (sceneElements[i].getIsChildElement(uuid)) {
                    return true;
                } 
            }

            return false;
        }
    }

    public getVisible(): boolean {
        return (this._content == null) || this._content.visible;
    }

    public async getContent(): Promise<Group> {
        return new Promise(async (resolve) => {
            if (!this._initialized) await this.draw();

            resolve(this._content);
        });
    }
    
    public isPartOfLayout(): boolean {
        if (this._parent) {
            if (this._parent instanceof VRLayout) return true;
            if (this._parent instanceof MainScene) return false;
            else return this._parent.isPartOfLayout();
        }
        else {
            return false;
        }
    }

    public isLayoutChild(layoutId: string): boolean {
        if (this._parent) {
            if ((this._parent instanceof VRLayout) && 
                ((this._parent as VRLayout).getId() == layoutId)) {
                    return true;
            }
            else if (this._parent instanceof MainScene) {
                return false
            }
            else {
                return this._parent.isLayoutChild(layoutId);
            }
        }
        else {
            return false;
        }
    }

    ////////// Setters

    public setWidth(width: number): Promise<void> {
        return new Promise(async (resolve) => {
            let keys = Array.from(this._childElements.keys());
            keys.sort(function(a, b){return a-b});
            
            for (let i=0; i< keys.length; i++) {
                await this._childElements.get(keys[i]).setWidth(width);
            }

            resolve();
        })
    }

    public setHidden(): void {
        this._content.visible = false;
    }
    
    public setVisible(): void {
        this._content.visible = true;
    }

    public enableLayout(layoutId: string): void {
        if (this._id == layoutId) this.setVisible();
        else this.setHidden();

        let keys = Array.from(this._childElements.keys());

        for (let i=0; i< keys.length; i++) {
            this._childElements.get(keys[i]).enableLayout(layoutId);
        }

        this._parent.draw();
    }

    public disableLayouts(): void {
        this.setHidden();

        let keys = Array.from(this._childElements.keys());

        for (let i=0; i< keys.length; i++) {
            this._childElements.get(keys[i]).disableLayouts();
        }

        this._parent.draw();
    }
    
    ////////// Public Methods

    // --- Data Methods

    public addChildElement(position: number, childElement: SceneElement): void {
        this._childElements.set(position, childElement);
    }
    
    // --- Rendering Methods

    public async draw(): Promise<void> {
        this._initialized = true;

        return new Promise(async (resolve) => {
            for (let i=(this._content.children.length-1); i>=0; i--) {
                this._content.remove(this._content.children[i]);
            }

            let keys = Array.from(this._childElements.keys());
            keys.sort(function(a, b){return a-b});
            
            for (let i=0; i< keys.length; i++) {
                this._content.add(await this._childElements.get(keys[i]).getContent());
            }
            
            resolve();
        });
    }

    public clicked(meshId: string): Promise<void> {
        return new Promise((resolve) => {
            let keys = Array.from(this._childElements.keys());

            for (let i=0; i< keys.length; i++) {
                this._childElements.get(keys[i]).clicked(meshId);
            }
            
            resolve();
        });
    }

    public update(delta: number): void {
        const childElements = this.getChildSceneElements();

        for (let i=0; i<childElements.length; i++) {
            childElements[i].update(delta);
        }
    }
}