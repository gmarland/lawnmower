import { 
    Mesh,
    Object3D,
    Vector3
} from 'three';


import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

import { Dimensions } from '../../geometry/Dimensions';
import { GeometryUtils } from '../../geometry/GeometryUtils';
import { PlaneUtils } from '../../geometry/PlaneUtils';
import { MainScene } from '../../scene/MainScene';
import { SceneElementPlacement } from '../../scene/SceneElementPlacement';
import { BaseSceneElement } from '../BaseSceneElement';

import { ISceneElement } from "../ISceneElement";
import { LMLayout } from '../lm-layout/LMLayout';
import { LMHTMLConfig } from './LMHTMLConfig';

export class LMHTML extends BaseSceneElement implements ISceneElement {
    private _src: string;

    private _initialWidth?: number = null; 
    private _initialHeight?: number = null;
    
    // Set through the API, typically through a parent div
    private _setWidth?: number = null; 
    private _setHeight?: number = null;

    private _calculatedWidth?: number = null;
    private _calculatedHeight?: number = null;

    private _borderRadius: number;

    private _mesh?: Mesh;
    
    private _drawing: boolean = false;
    private _redraw: boolean = false;

    public onClick?: Function = null;

    constructor(parent: ISceneElement, position: Vector3, id: string, src: string, config: LMHTMLConfig) {
        let offset = null;
        if (config.offset) offset = config.offset;
        
        super(parent, config.shadowsEnabled, position, id, offset);

        this._src = src;

        if (config.width) this._initialWidth = config.width;
        if (config.height) this._initialHeight = config.height;

        this._borderRadius = config.borderRadius;
        
        this.content.translateZ(1);
    }

    ////////// Getters
    
    public get placementLocation(): SceneElementPlacement {
        return SceneElementPlacement.Main;
    }

    public get dimensions(): Dimensions {
        return {
            width: this.width,
            height: this.height
        };
    }

    public get dynamicWidth(): boolean {
        return (this._initialWidth == null);
    }

    public get width(): number {
        if (this._setWidth !== null) return this._setWidth;
        else return this._initialWidth ? this._initialWidth : 0;
    }

    public get height(): number {
        if (this._calculatedHeight !== null) return this._calculatedHeight;
        else if (this._setHeight !== null) return this._setHeight;
        else return this._initialHeight;
    }
    
    public get src(): string {
        return this._src;
    }
    
    public get borderRadius(): number {
        return this._borderRadius;
    }

    ////////// Setters

    public set src(value: string) {
        this._src = value;
    }

    public set width(value: number) {
        this._setWidth = value;
    }

    public set height(value: number) {
        this._setHeight = value;
    }

    public set borderRadius(value: number) {
        this._borderRadius = value;
    }

    ////////// Public Methods

    // --- Layout management

    public enableLayout(layoutId: string): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    public disableLayouts(): Promise<void> {
        return new Promise((resolve) => {
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

    // --- Child management

    public addChildElement(position: number, childElement: ISceneElement): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    public removeChildElement(childElement: ISceneElement): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }
    
    public getChildSceneElements(): ISceneElement[] {
        return [];
    }

    // --- Rendering Methods
    
    public async getPosition(): Promise<Vector3> {
        return new Promise(async (resolve) => {
            if (!this.initialized) await this.draw();
    
            resolve(this.content.position);
        });
    }

    public async getContent(): Promise<Object3D> {
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

                let contentWidth = this._initialWidth;
                if (this._setWidth !== null) contentWidth = this._setWidth;

                let contentHeight = this._initialHeight;
                if (this._setHeight !== null) contentHeight = this._setHeight;

                await this.generateContent(contentWidth, contentHeight);
                    
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
            if (this._mesh && (this._mesh.uuid === meshId) && (this.onClick)) {
                this.onClick();
            }
            
            resolve();
        })
    }

    public update(delta: number): void {
    }

    public destroy(): Promise<void> {
        return new Promise((resolve) => {
            if (this.parent && this.parent.removeChildElement) this.parent.removeChildElement(this);

            if (this.content) {
                this.content.clear();
                this.content = null;
            }

            this.destroyMesh();

            resolve();
        });
    }

    ////////// Private Methods

    private async generateContent(width: number, height: number): Promise<void> {
        return new Promise(async (resolve) => {
            this.content.clear();

            this.destroyMesh();
            
            this._mesh = await this.buildMesh(width, height);

            this.content.add(this._mesh);

            resolve();
        });
    }

    private async buildMesh(width: number, height: number): Promise<Mesh> {
        return new Promise(async (resolve) => {
            const div = document.createElement( 'div' );
            div.style.width = '480px';
            div.style.height = '360px';

            const iframe = document.createElement( 'embed' );
            iframe.width = '480px';
            iframe.height = '360px';
            iframe.src = this._src;

            div.appendChild( iframe );

            const mesh = new CSS3DObject( iframe );
        
            if (this.shadowsEnabled) {
                if ((this.parent && (this.parent instanceof MainScene)) || ((this.offset != null) && (this.offset !== 0))) mesh.castShadow = true;
                else mesh.castShadow = false;
    
                mesh.receiveShadow = true;
            }
            else {
                mesh.receiveShadow = false;
                mesh.castShadow = false;
            }

            if (this._borderRadius > 0) PlaneUtils.generateMeshUVs(mesh);
    
            resolve(mesh);
        });
    }

    private destroyMesh(): void {
        if (this._mesh) {
            this._mesh = null;
        }
    }
}