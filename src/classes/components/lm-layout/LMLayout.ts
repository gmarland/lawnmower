import { 
    Box3,
    Group,
    Vector3
} from 'three';

import { Dimensions } from '../../geometry/Dimensions';
import { GeometryUtils } from '../../geometry/GeometryUtils';
import { MainScene } from '../../scene/MainScene';
import { SceneElementPlacement } from '../../scene/SceneElementPlacement';
import { BaseSceneElement } from '../BaseSceneElement';
import { ISceneElement } from '../ISceneElement';

export class LMLayout extends BaseSceneElement implements ISceneElement {
    private _drawing: boolean = false;
    private _redraw: boolean = false;

    private _childElements: Map<number, ISceneElement> = new Map<number, ISceneElement>();

    constructor(parent: ISceneElement, shadowsEnabled: boolean, position: Vector3, id: string) {
        super(parent, shadowsEnabled, position, id);

        this.content.name = "layout";
        this.content.visible = false;
    }

    ////////// Getters

    public get placementLocation(): SceneElementPlacement {
        return SceneElementPlacement.Main;
    }

    public get dimensions(): Dimensions {
        return {
            width: 0,
            height: 0
        }
    }
    
    public get dynamicWidth(): boolean {
        return true;
    }
    
    public get width(): number {
        const contentBox = new Box3().setFromObject(this.content);

        return (contentBox.max.x - contentBox.min.x);
    }

    ////////// Setters
    
    public set width(value: number) {
        let keys = Array.from(this._childElements.keys());
        keys.sort(function(a, b){return a-b});
        
        for (let i=0; i< keys.length; i++) {
            const childElement = this._childElements.get(keys[i]);

            if (childElement.dynamicWidth) {
                childElement.width = value;
                childElement.draw();
            }
        }
    }
    
    ////////// Public Methods

    // --- Layout Managment

    public enableLayout(layoutId: string): Promise<void> {
        return new Promise(async (resolve) => {
            if (this.id == layoutId) this.visible = true;
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

    public isPartOfLayout(): boolean {
        if (this.parent) {
            if (this.parent instanceof LMLayout) return true;
            if (this.parent instanceof MainScene) return false;
            else return this.parent.isPartOfLayout();
        }
        else {
            return false;
        }
    }

    public isLayoutChild(layoutId: string): boolean {
        if (this.parent) {
            if ((this.parent instanceof LMLayout) && 
                ((this.parent as LMLayout).id == layoutId)) {
                    return true;
            }
            else if (this.parent instanceof MainScene) {
                return false
            }
            else {
                return this.parent.isLayoutChild(layoutId);
            }
        }
        else {
            return false;
        }
    }
    
    // --- Child Management

    public addChildElement(position: number, childElement: ISceneElement): Promise<void> {
        return new Promise(async (resolve) => {
            if (this._childElements.has(position)) {
                let keys = Array.from(this._childElements.keys());
                keys.sort(function(a, b){return a-b});
                
                for (let i=(keys.length-1); i>=position; i--) {
                    if (keys[i] >= position) {
                        const childElement = this._childElements.get(keys[i]);
    
                        this._childElements.set((keys[i]+1), childElement);
                        this._childElements.delete(keys[i]);
                    }
                }
            }
    
            this._childElements.set(position, childElement);
    
            if (this.initialized) { 
                const sizeUpdated = await this.draw();
                if (this.visible && sizeUpdated) await this.drawParent();
            }

            resolve();
        });
    }

    public removeChildElement(childElement: ISceneElement): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    public getChildSceneElements(): ISceneElement[] {
        let keys = Array.from(this._childElements.keys());
        keys.sort(function(a, b){return a-b});

        const elements = [];
        
        for (let i=0; i< keys.length; i++) {
            elements.push(this._childElements.get(keys[i])); 
        }

        return elements;
    }

    public getIsChildElement(uuid: string): boolean {
        if (uuid === this.uuid) {
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

    // --- Rendering Methods
    
    public async getPosition(): Promise<Vector3> {
        return new Promise(async (resolve) => {
            if (!this.initialized) await this.draw(); 
    
            resolve(this.content.position);
        });
    }

    public async getContent(): Promise<Group> {
        return new Promise(async (resolve) => {
            if (!this.initialized) await this.draw();

            resolve(this.content);
        });
    }

    public async drawParent(): Promise<void> {
        const updatedDimensions = await this.parent.draw();
        if (updatedDimensions || (this.parent instanceof LMLayout)) await this.parent.drawParent();
    }

    public async draw(): Promise<boolean> {
        this.initialized = true;

        return new Promise(async (resolve) => {
            if (!this._drawing) {
                this._drawing = true;
                this._redraw = false;

                const currentDimensions = GeometryUtils.getDimensions(this.content);

                this.content.clear();

                let keys = Array.from(this._childElements.keys());
                keys.sort(function(a, b){return a-b});
                
                for (let i=0; i< keys.length; i++) {
                    const childElement = this._childElements.get(keys[i]);

                    if (childElement.visible) this.content.add(await childElement.getContent());
                }
                
                this._drawing = false;
                    
                if (this._redraw) {
                    await this.draw();
                    
                    const newDimensions = GeometryUtils.getDimensions(this.content);

                    resolve(((currentDimensions.width !== newDimensions.width) || (currentDimensions.height !== newDimensions.height)));
                }
                else {
                    const newDimensions = GeometryUtils.getDimensions(this.content);

                    resolve(((currentDimensions.width !== newDimensions.width) || (currentDimensions.height !== newDimensions.height)));
                }
            }
            else {
                this._redraw = true;

                resolve(false);
            }
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

    public destroy(): Promise<void> {
        return new Promise((resolve) => {
            if (this.parent && this.parent.removeChildElement) this.parent.removeChildElement(this);

            if (this.content) {
                this.content.clear();
                this.content = null;
            }
            
            resolve();
        });
    }
}