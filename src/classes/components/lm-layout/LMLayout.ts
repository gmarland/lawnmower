import { 
    Box3,
    Group,
    Vector3
} from 'three';

import { Dimensions } from '../../geometry/Dimensions';
import { GeometryUtils } from '../../geometry/GeometryUtils';

import { MeshUtils } from "../../geometry/MeshUtils";
import { MainScene } from '../../scene/MainScene';
import { SceneElementPlacement } from '../../scene/SceneElementPlacement';
import { SceneElement } from '../SceneElement';

export class LMLayout implements SceneElement {
    private _parent: SceneElement;

    private _id: string;

    private _uuid: string;

    private _content?: Group = new Group();

    private _initialized: boolean = false;
    
    private _drawing: boolean = false;
    private _redraw: boolean = false;

    private _childElements: Map<number, SceneElement> = new Map<number, SceneElement>();

    constructor(parent: SceneElement, id: string) {
        this._parent = parent;

        this._id = id;
        
        this._uuid = MeshUtils.generateId();
        
        this._content.name = "layout";
        this._content.visible = false;
    }

    ////////// Getters

    public get id() {
        return this._id;
    }
    
    public get uuid(): string {
        return this._uuid;
    }
    
    public get dynamicWidth(): boolean {
        return true;
    }
    
    public get width(): number {
        const contentBox = new Box3().setFromObject(this._content);

        return (contentBox.max.x - contentBox.min.x);
    }

    public get visible(): boolean {
        return (this._content == null) || this._content.visible;
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

    public async getContent(): Promise<Group> {
        return new Promise(async (resolve) => {
            if (!this._initialized) await this.draw();

            resolve(this._content);
        });
    }
    
    public isPartOfLayout(): boolean {
        if (this._parent) {
            if (this._parent instanceof LMLayout) return true;
            if (this._parent instanceof MainScene) return false;
            else return this._parent.isPartOfLayout();
        }
        else {
            return false;
        }
    }

    public isLayoutChild(layoutId: string): boolean {
        if (this._parent) {
            if ((this._parent instanceof LMLayout) && 
                ((this._parent as LMLayout).id == layoutId)) {
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


    public set width(value: number) {
        let keys = Array.from(this._childElements.keys());
        keys.sort(function(a, b){return a-b});
        
        for (let i=0; i< keys.length; i++) {
            const childElement = this._childElements.get(keys[i]);

            childElement.width = value;
            childElement.draw();
        }
    }

    public set visible(value: boolean) {
        this._content.visible = value;
    }

    public enableLayout(layoutId: string): Promise<void> {
        return new Promise(async (resolve) => {
            if (this._id == layoutId) this.visible = true;
            else this.visible = false;
    
            let keys = Array.from(this._childElements.keys());
    
            for (let i=0; i< keys.length; i++) {
                await this._childElements.get(keys[i]).enableLayout(layoutId);
            }
    
            await this.drawParent();

            resolve();
        });
    }

    public disableLayouts(): Promise<void> {
        return new Promise(async (resolve) => {
            this.visible = false;;

            let keys = Array.from(this._childElements.keys());

            for (let i=0; i< keys.length; i++) {
                await this._childElements.get(keys[i]).disableLayouts();
            }
            
            await this.drawParent();

            resolve();
        });
    }
    
    ////////// Public Methods

    // --- Data Methods

    public addChildElement(position: number, childElement: SceneElement): void {
        this._childElements.set(position, childElement);
    }
    
    // --- Rendering Methods

    public async draw(): Promise<boolean> {
        this._initialized = true;

        return new Promise(async (resolve) => {
            if (!this._drawing) {
                this._drawing = true;
                this._redraw = false;

                const currentDimensions = GeometryUtils.getDimensions(this._content);

                for (let i=(this._content.children.length-1); i>=0; i--) {
                    this._content.remove(this._content.children[i]);
                }

                let keys = Array.from(this._childElements.keys());
                keys.sort(function(a, b){return a-b});
                
                for (let i=0; i< keys.length; i++) {
                    const childElement = this._childElements.get(keys[i]);

                    if (childElement.visible) this._content.add(await childElement.getContent());
                }
                
                this._drawing = false;
                    
                if (this._redraw) {
                    await this.draw();
                    
                    const newDimensions = GeometryUtils.getDimensions(this._content);

                    resolve(((currentDimensions.width !== newDimensions.width) || (currentDimensions.height !== newDimensions.height)));
                }
                else {
                    const newDimensions = GeometryUtils.getDimensions(this._content);

                    resolve(((currentDimensions.width !== newDimensions.width) || (currentDimensions.height !== newDimensions.height)));
                }
            }
            else {
                this._redraw = true;

                resolve(false);
            }
        });
    }

    public async drawParent(): Promise<void> {
        const updatedDimensions = await this._parent.draw();
        if (updatedDimensions) await this._parent.drawParent();
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