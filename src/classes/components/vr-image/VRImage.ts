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
import { MaterialUtils } from '../../geometry/MaterialUtils';
import { MeshUtils } from '../../geometry/MeshUtils';
import { PlaneUtils } from '../../geometry/PlaneUtils';
import { MainScene } from '../../scene/MainScene';
import { SceneElementPlacement } from '../../scene/SceneElementPlacement';

import { SceneElement } from "../SceneElement";
import { VRLayout } from '../vr-layout/VRLayout';
import { VRImageConfig } from './VRImageConfig';

export class VRImage implements SceneElement {
    private _parent: SceneElement;

    private _uuid: string;

    private _src: string;

    private _initialWidth?: number = null; 
    private _initialHeight?: number = null;
    
    private _setWidth?: number = null; // Set through the API, typically through a parent div
    private _setHeight?: number = null;

    private _borderRadius: number;

    private _calculatedHeight?: number = null;

    private _mesh?: Mesh;
    private _content: Object3D = new Object3D();
    private _initialized: boolean = false;

    public onClick?: Function = null;

    constructor(parent: SceneElement, src: string, config: VRImageConfig) {
        this._parent = parent;

        this._uuid = MeshUtils.generateId();
        
        this._src = src;

        if (config) {
            if (config.width) this._initialWidth = config.width;
            if (config.height) this._initialHeight = config.height;

            this._borderRadius = config.borderRadius;
        }
        
        this._content.translateZ(0.5);
    }

    ////////// Getters
    
    public get uuid(): string {
        return this._uuid;
    }

    public get width() {
        if (this._setWidth !== null) return this._setWidth;
        else return this._initialWidth;
    }

    public get height() {
        if (this._calculatedHeight !== null) return this._calculatedHeight;
        else if (this._setHeight !== null) return this._setHeight;
        else return this._initialHeight;
    }
    
    public get src(): string {
        return this._src;
    }
    
    public getPlacementLocation(): SceneElementPlacement {
        return SceneElementPlacement.Main;
    }

    public async getContent(): Promise<Object3D> {
        return new Promise(async (resolve) => {
            if (!this._initialized) await this.draw();

            resolve(this._content);
        });
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

    public getVisible(): boolean {
        return this._content.visible;
    }
    
    public getChildSceneElements(): SceneElement[] {
        return [];
    }

    public getIsChildElement(uuid: string): boolean {
        return uuid === this._uuid;
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

    public set src(value: string) {
        this._src = value;
    }

    public set width(value: number) {
        this._setWidth = value;
    }

    public set height(value: number) {
        this._setHeight = value;
    }

    public setHidden(): void {
        this._content.visible = false;
    }
    
    public setVisible(): void {
        this._content.visible = true;
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

    ////////// Public Methods

    // --- Data Methods

    public addChildElement(position: number, childElement: SceneElement): void {
    }

    // --- Rendering Methods

    public async draw(): Promise<void> {
        this._initialized = true;

        return new Promise(async (resolve) => {
            if (this._setWidth !== null) await this.generateContent(this._setWidth);
            else await this.generateContent(this._initialWidth);

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

    private async generateContent(width: number): Promise<void> {
        return new Promise(async (resolve) => {
            for (let i=(this._content.children.length-1); i>=0; i--) {
                this._content.remove(this._content.children[i]);
            }

            if (this._mesh) {
                this._mesh.geometry.dispose();
                this._mesh.material.dispose();
                this._mesh = null;
            }

            this._mesh = await this.buildMesh(width);

            this._content.add(this._mesh);

            resolve();
        });
    }

    private async buildTexture(width: number): Promise<CanvasTexture> {
        return new Promise(async (resolve) => {
            const textTexture = await new TextureLoader().load(this._src, (tex) => {
                tex.wrapS = ClampToEdgeWrapping;
                tex.wrapT = RepeatWrapping;

                if (this._setHeight) {
                    this._calculatedHeight = this._setHeight;
                }
                else if (this._initialHeight) {
                    this._calculatedHeight = this._initialHeight;
                }
                else if (width) {
                    const widthRatio = tex.image.width/width;

                    this._calculatedHeight = tex.image.height/widthRatio;
                }
                else {
                    this._calculatedHeight = 0;
                }

                if (this._calculatedHeight > width) {
                    let repeatX = width * tex.image.height / (this._calculatedHeight * tex.image.width);
                    let repeatY = 1;
                    
                    tex.repeat.set(repeatX, repeatY);
                    
                    tex.offset.x = (repeatX - 1) / 2 * -1;
                }
                else {
                    let repeatX = 1;
                    let repeatY = this._calculatedHeight * tex.image.width / (width * tex.image.height);
                    
                    tex.repeat.set(repeatX, repeatY);
                    
                    tex.offset.y = (repeatY - 1) / 2 * -1;
                }
                
                textTexture.needsUpdate = true;

                resolve(textTexture)
            });
        });
    }

    private async buildMesh(width: number): Promise<Mesh> {
        return new Promise(async (resolve) => {
            let buildWidth = 0;
            if (width) buildWidth = width;

            const imageTexture = await this.buildTexture(buildWidth);
            
            let buildHeight = 0;
            if (this._calculatedHeight) buildHeight = this._calculatedHeight;
            
            const geometry = PlaneUtils.getPlane(buildWidth, buildHeight, this._borderRadius);
            
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