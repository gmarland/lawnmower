import { 
    Mesh,
    Object3D,
    Vector3,
    Box3,
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
import { SceneElementPlacement } from '../../scene/SceneElementPlacement';

import { SceneElement } from "../SceneElement";
import { VRImageConfig } from './VRImageConfig';

export class VRImage implements SceneElement {
    private _depth: number;

    private _parent: SceneElement;

    private _uuid: string;

    private _src: string;

    private _width: number; 
    private _height: number;

    private _borderRadius: number;

    private _calculatedHeight: number;

    private _mesh?: Mesh = null;
    private _content: Object3D = new Object3D();

    public onClick?: Function = null;

    constructor(depth: number, parent: SceneElement, src: string, config: VRImageConfig) {
        this._depth = depth;

        this._parent = parent;

        this._uuid = MeshUtils.generateId();
        
        this._src = src;

        this._width = config.width;
        this._height = config.height;

        this._borderRadius = config.borderRadius;
        
        this._content.translateZ(this._depth*0.5);
    }

    ////////// Getters
    
    public getUUID(): string {
        return this._uuid;
    }
    
    public getPlacementLocation(): SceneElementPlacement {
        return SceneElementPlacement.Main;
    }

    public async getContent(): Promise<Object3D> {
        return new Promise(async (resolve) => {
            await this.generateContent(this._width);

            resolve(this._content);
        });
    }

    public getDimensions(): Dimensions {
        return {
            width: this._width,
            height: this._calculatedHeight
        };
    }

    public getCalculatedDimensions(): Dimensions {
        const dimensions = new Box3().setFromObject(this._content);

        return {
            width: dimensions.max.x-dimensions.min.x,
            height: dimensions.max.y-dimensions.min.y
        }
    }
    
    public getPosition(): Vector3 {
        return this._content.position;
    }
    
    public getChildSceneElements(): SceneElement[] {
        return [];
    }

    ////////// Setters

    public setWidth(width: number): void {
        this._width = width;
    }

    public async setCalculatedWidth(width: number): Promise<void> {
        await this.generateContent(width);
    }

    public setHidden(): void {
        this._content.visible = false;
    }
    
    public setVisible(): void {
        this._content.visible = true;
    }

    ////////// Public Methods

    // --- Data Methods

    public addChildElement(position: number, childElement: SceneElement): void {
    }

    // --- Rendering Methods

    public clicked(meshId: string): Promise<void> {
        return new Promise((resolve) => {
            if ((this._mesh.uuid === meshId) && (this.onClick)) {
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

                if (this._height) {
                    this._calculatedHeight = this._height;
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