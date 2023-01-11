import { 
    Mesh,
    Object3D,
    Vector3,
    CanvasTexture,
    LinearFilter,
    TextureLoader,
    ClampToEdgeWrapping,
    RepeatWrapping
} from 'three';

import { Dimensions } from '../../geometry/Dimensions';
import { GeometryUtils } from '../../geometry/GeometryUtils';
import { MaterialUtils } from '../../geometry/MaterialUtils';
import { MeshUtils } from '../../geometry/MeshUtils';
import { PlaneUtils } from '../../geometry/PlaneUtils';
import { MainScene } from '../../scene/MainScene';
import { SceneElementPlacement } from '../../scene/SceneElementPlacement';

import { SceneElement } from "../SceneElement";
import { LMLayout } from '../lm-layout/LMLayout';
import { LMImageConfig } from './LMImageConfig';

export class LMImage implements SceneElement {
    private _parent: SceneElement;

    private _id: string;

    private _uuid: string;

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
    private _content: Object3D = new Object3D();

    private _initialized: boolean = false;
    
    private _drawing: boolean = false;
    private _redraw: boolean = false;

    public onClick?: Function = null;

    constructor(parent: SceneElement, src: string, config: LMImageConfig) {
        this._parent = parent;

        this._uuid = MeshUtils.generateId();
        
        this._src = src;

        if (config.width) this._initialWidth = config.width;
        if (config.height) this._initialHeight = config.height;

        this._borderRadius = config.borderRadius;
        
        this._content.translateZ(0.5);
    }

    ////////// Getters
    
    public get id(): string {
        return this._id;
    }
    
    public get uuid(): string {
        return this._uuid;
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

    public get visible(): boolean {
        return this._content.visible;
    }

    ////////// Setters

    public set id(value: string) {
        this._id = value;
    }

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

    public set visible(value: boolean) {
        this._content.visible = value;
    }

    ////////// Public Methods

    // --- Data Methods
    
    public getPlacementLocation(): SceneElementPlacement {
        return SceneElementPlacement.Main;
    }

    public getDimensions(): Dimensions {
        return {
            width: this.width,
            height: this.height
        };
    }
    
    public async getPosition(): Promise<Vector3> {
        return new Promise(async (resolve) => {
            if (!this._initialized) await this.draw();
    
            resolve(this._content.position);
        });
    }

    public addChildElement(position: number, childElement: SceneElement): void {
    }
    
    public getChildSceneElements(): SceneElement[] {
        return [];
    }

    public getIsChildElement(uuid: string): boolean {
        return uuid === this._uuid;
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

    // --- Rendering Methods

    public async getContent(): Promise<Object3D> {
        return new Promise(async (resolve) => {
            if (!this._initialized) await this.draw();

            resolve(this._content);
        });
    }

    public async draw(): Promise<boolean> {
        this._initialized = true;

        return new Promise(async (resolve) => {
            if (!this._drawing) {
                this._drawing = true;
                this._redraw = false;

                const currentDimensions = GeometryUtils.getDimensions(this._content);

                let contentWidth = this._initialWidth;
                if (this._setWidth !== null) contentWidth = this._setWidth;

                let contentHeight = this._initialHeight;
                if (this._setHeight !== null) contentHeight = this._setHeight;

                await this.generateContent(contentWidth, contentHeight);
                    
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

    ////////// Private Methods

    private async generateContent(width: number, height: number): Promise<void> {
        return new Promise(async (resolve) => {
            for (let i=(this._content.children.length-1); i>=0; i--) {
                this._content.remove(this._content.children[i]);
            }

            if (this._mesh) {
                this._mesh.geometry.dispose();
                this._mesh.material.dispose();
                this._mesh = null;
            }

            this._mesh = await this.buildMesh(width, height);

            this._content.add(this._mesh);

            resolve();
        });
    }

    private async buildTexture(width: number, height: number): Promise<CanvasTexture> {
        return new Promise(async (resolve) => {
            const textTexture = await new TextureLoader().load(this._src, (tex) => {
                tex.wrapS = ClampToEdgeWrapping;
                tex.wrapT = RepeatWrapping;

    
                if ((width !== null) && (width > height)) {
                    this._calculatedWidth = width;

                    const widthRatio = tex.image.width/width;
    
                    this._calculatedHeight = tex.image.height/widthRatio;

                    let repeatX = 1;
                    let repeatY = (this._calculatedHeight * tex.image.width) / (this._calculatedWidth * tex.image.height);
                    
                    tex.repeat.set(repeatX, repeatY);
                    
                    tex.offset.y = (repeatY - 1) / (2 * -1);
                }
                else if (this.height !== null) {
                    this._calculatedHeight = height;

                    const heightRatio = tex.image.height/height;

                    this._calculatedWidth = tex.image.width/heightRatio;

                    let repeatX = this._calculatedWidth * tex.image.height / (this._calculatedHeight * tex.image.width);
                    let repeatY = 1;
                    
                    tex.repeat.set(repeatX, repeatY);
                    
                    tex.offset.x = (repeatX - 1) / (2 * -1);
                }
                else {
                    this._calculatedWidth = 0;
                    this._calculatedHeight = 0;
                }
                
                textTexture.needsUpdate = true;

                resolve(textTexture)
            });
        });
    }

    private async buildMesh(width: number, height: number): Promise<Mesh> {
        return new Promise(async (resolve) => {
            const imageTexture = await this.buildTexture(width, height);
            
            const geometry = PlaneUtils.getPlane(this._calculatedWidth, this._calculatedHeight, this._borderRadius);
            
            const material = MaterialUtils.getBasicMaterial({
                map: imageTexture,
                transparent: false
            });
            material.map.minFilter = LinearFilter;
            
            const mesh = new Mesh(geometry, material);
            mesh.recieveShadow = true;
            
            if (this._borderRadius > 0) PlaneUtils.generateMeshUVs(mesh);
    
            resolve(mesh);
        });
    }
}