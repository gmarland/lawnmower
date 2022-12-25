import { 
    Box3,
    Group,
    Vector3,
    Mesh,
    Color,
    DoubleSide,
    TextureLoader
} from 'three';

import { Dimensions } from "../../geometry/Dimensions";
import { GeometryUtils } from '../../geometry/GeometryUtils';
import { MaterialUtils } from '../../geometry/MaterialUtils';
import { MeshUtils } from '../../geometry/MeshUtils';
import { PlaneUtils } from '../../geometry/PlaneUtils';
import { SceneElementPlacement } from '../../scene/SceneElementPlacement';
import { SceneElement } from "../SceneElement";
import { VRVideoControlsConfig } from './VRVideoControlsConfig';

export class VRVideoControls implements SceneElement {
    private _depth: number;

    private _parent: SceneElement;

    private _uuid: string;

    private _mesh: Mesh;

    private _closeMesh: Mesh;

    private _playMesh: Mesh;
    private _pauseMesh: Mesh;
   
    private _color: string;

    private _baseImagePath: string;
    
    private _width: number;

    private _height: number;

    private _borderRadius: number = 10;
    
    private _padding: number = 10;

    private _x: number;
    
    private _y: number;
    
    private _z: number;

    private _content: Group = new Group();

    public onPlay?: Function = null;
    public onPause?: Function = null;
    public onClose?: Function = null;

    constructor(depth: number, parent: SceneElement, config: VRVideoControlsConfig) {
        this._depth = depth;

        this._parent = parent;

        this._uuid = MeshUtils.generateId();

        this._baseImagePath = config.baseImagePath;

        this._color = config.color;

        this._width = config.width;
        this._height = config.height;

        this._x = config.x;
        this._y = config.y;
        this._z = config.z;
        
        this._content = new Group();
        this._content.visible = false;
    }

    ////////// Getters
    
    public getUUID(): string {
        return this._uuid;
    }

    public getPlacementLocation(): SceneElementPlacement {
        return SceneElementPlacement.AttachedToCamera;
    }
    
    public getContent(): Promise<Group> {
        return new Promise(async (resolve) => {
            await this.generateContent(this._width);

            resolve(this._content);
        });
    }
    
    public getDimensions(): Dimensions {
        return {
            width: this._width,
            height: this._height
        }
    }

    public getVisible() {
        return this._content.visible;
    }
    
    public getCalculatedDimensions(): Dimensions {
        const dimensions = new Box3().setFromObject(this._content);

        return {
            width: dimensions.max.x-dimensions.min.x,
            height: dimensions.max.y-dimensions.min.y
        }
    }
    
    public getPosition(): Vector3 {
        return new Vector3(this._x, this._y, this._z);
    }
    
    public getChildSceneElements(): SceneElement[] {
        return [];
    }

    ////////// Setters

    public setWidth(width: number): void {
        this._width = width;
    }
    
    public setCalculatedWidth(width: number): Promise<void> {
        return new Promise(async (resolve) => {
            await this.generateContent(width);

            resolve();
        });
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
            if (meshId === this._playMesh.uuid) {
                this._playMesh.visible = false;
                this._pauseMesh.visible = true;

                if (this.onPlay) this.onPlay();
            }
            
            if (meshId === this._pauseMesh.uuid) {
                this._pauseMesh.visible = false;
                this._playMesh.visible = true;

                if (this.onPause) this.onPause();
            }
            
            if (meshId === this._closeMesh.uuid) {
                if (this.onClose) this.onClose();
            }

            resolve();
        });
    }

    public show(isPlaying: boolean): void {
        if (isPlaying) {
            this._playMesh.visible = false;
            this._pauseMesh.visible = true;
        }
        else {
            this._playMesh.visible = true;
            this._pauseMesh.visible = false;
        }

        this.setVisible();
    }

    public update(delta: number): void {
    }

    ////////// Private Methods
    
    private async generateContent(width: number): Promise<void> {
        return new Promise((resolve) => {
            // Clean up existing layout

            for (let i=(this._content.children.length-1); i>=0; i--) {
                this._content.remove(this._content.children[i]);
            }

            if (this._mesh) {
                this._mesh.geometry.dispose();
                this._mesh.material.dispose();
                this._mesh = null;
            }

            // Build layout
        
            const geometry = PlaneUtils.getPlane(width, this._height, this._borderRadius);
    
            const material = MaterialUtils.getBasicMaterial({
                color: new Color(this._color),
                side: DoubleSide
            });
            
            this._mesh = new Mesh(geometry, material);
            this._mesh.rotation.y = GeometryUtils.degToRad(180);
            this._mesh.rotation.z = GeometryUtils.degToRad(180);
            
            this._closeMesh = new Mesh(PlaneUtils.getSquaredPlane(this._height-(this._padding*2), this._height-(this._padding*2)), MaterialUtils.getBasicMaterial({
                map: new TextureLoader().load(this._baseImagePath + '/close.png'),
                transparent: true,
                side: DoubleSide
            }));

            this._playMesh = new Mesh(PlaneUtils.getSquaredPlane(this._height-(this._padding*2), this._height-(this._padding*2)), MaterialUtils.getBasicMaterial({
                map: new TextureLoader().load(this._baseImagePath + '/play.png'),
                transparent: true,
                side: DoubleSide
            }));

            this._pauseMesh = new Mesh(PlaneUtils.getSquaredPlane(this._height-(this._padding*2), this._height-(this._padding*2)), MaterialUtils.getBasicMaterial({
                map: new TextureLoader().load(this._baseImagePath + '/pause.png'),
                transparent: true,
                side: DoubleSide
            }));
            this._pauseMesh.visible = false;

            this._closeMesh.translateX(((width/2)*-1) + (this._height/2));
            this._closeMesh.translateZ(-0.2);
            this._playMesh.translateX((width/2) - (this._height/2));
            this._playMesh.translateZ(-0.2);
            this._pauseMesh.translateX((width/2) - (this._height/2));
            this._pauseMesh.translateZ(-0.2);

            this._mesh.add(this._closeMesh);
            this._mesh.add(this._playMesh);
            this._mesh.add(this._pauseMesh);

            this._content.add(this._mesh);

            resolve();
        });
    }
}