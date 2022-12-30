import { 
    AnimationMixer,
    Group,
    AnimationClip,
    BoxGeometry,
    Mesh,
    Vector3,
    Box3
} from 'three';

import { Dimensions } from "../../geometry/Dimensions";
import { GeometryUtils } from '../../geometry/GeometryUtils';
import { MeshUtils } from '../../geometry/MeshUtils';
import { SceneElement } from "../SceneElement";
import { VRAssetConfig } from './VRAssetConfig';
import { AssetLoader } from './AssetLoader';
import { SceneElementPlacement } from '../../scene/SceneElementPlacement';
import { MaterialUtils } from '../../geometry/MaterialUtils';
import { VRLayout } from '../vr-layout/VRLayout';
import { MainScene } from '../../scene/MainScene';

export class VRAsset implements SceneElement {
    private _depth: number;

    private _parent: SceneElement;

    private _uuid: string;

    private _src: string;

    private _loadedAsset?: Group = null;

    private _animations: Array<AnimationClip>;

    private _activeAnimation: string;

    private _animationMixer: AnimationMixer;

    private _action;

    private _loadedAssetContainer: Group;
    private _content: Group = new Group();

    private _xRotation: number; 
    private _yRotation: number; 
    private _zRotation: number;

    private _radius: number; 
    private _setRadius?: number;

    private _xRotationSpeed: number = 0;
    private _yRotationSpeed: number = 0;
    private _zRotationSpeed: number = 0;

    public onClick?: Function = null;

    constructor(depth: number, parent: SceneElement, src: string, assetConfig: VRAssetConfig) {
        this._depth = depth;

        this._parent = parent;

        this._uuid = MeshUtils.generateId();

        this._src = src;

        this._activeAnimation = assetConfig.activeAnimation;

        this._radius = assetConfig.radius;

        this._xRotation = assetConfig.xRotation;
        this._yRotation = assetConfig.yRotation;
        this._zRotation = assetConfig.zRotation;

        this._xRotationSpeed = assetConfig.xRotationSpeed;
        this._yRotationSpeed = assetConfig.yRotationSpeed;
        this._zRotationSpeed = assetConfig.zRotationSpeed;
    }

    ////////// Getters
    
    public getUUID(): string {
        return this._uuid;
    }
    
    public getPlacementLocation(): SceneElementPlacement {
        return SceneElementPlacement.Main;
    }

    public getContent(): Promise<Group> {
        return new Promise(async (resolve) => {
            if (!this._loadedAsset) {          
                new AssetLoader().load(this._src, this._radius).then((loadedAssetDetail) => {
                    this._loadedAsset = loadedAssetDetail.element;
                    this._loadedAsset.recieveShadow = true;
                    this._animations = loadedAssetDetail.animations;
                    
                    if (this._animations && (this._animations.length > 0)) {
                        this._animationMixer = new AnimationMixer(this._loadedAsset);

                        if (this._activeAnimation) {
                            this._action = this._animationMixer.clipAction(AnimationClip.findByName(this._animations, this._activeAnimation));
                            this.startAnimation();
                        }
                    }                   

                    this._loadedAssetContainer = new Group();
                    this._loadedAssetContainer.add(this._loadedAsset);
                    
                    this._loadedAssetContainer.rotation.set(GeometryUtils.degToRad(this._xRotation,), GeometryUtils.degToRad(this._yRotation), GeometryUtils.degToRad(this._zRotation));
                
                    this._content.add(this._loadedAssetContainer);
                    this._content.add(this.drawShapingCube());
                    
                    resolve(this._content);
                });        
            }
            else {
                resolve(this._content);
            }
        });
    }

    public getActiveAnimationName(): string {
        return this._activeAnimation;
    }

    public getAnimationNames(): Array<string> {
        const animationNames = new Array<string>();

        for (let i=0; i<this._animations.length; i++) {
            animationNames.push(this._animations[i].name);
        } 

        return animationNames;
    }

    public getDimensions(): Dimensions {
        return {
            width: this._radius,
            height: this._radius
        };
    }
    
    public async getPosition(): Promise<Vector3> {
        return new Promise(async (resolve) => {
            if (!this._content) await this.getContent(); 
    
            resolve(this._content.position);
        });
    }

    public getVisible(): boolean {
        return (this._content == null) || this._content.visible;
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

    public setWidth(width: number): void {
        this._radius = width;
    }

    public setActiveAnimation(animationName: string): void {
        this._activeAnimation = animationName;
        
        this.stopAnimation();
        this._action = this._animationMixer.clipAction(AnimationClip.findByName(this._animations, this._activeAnimation));
        this.startAnimation();
    }
    
    public setRotation(x: number, y: number, z: number): void {
        this._loadedAssetContainer.rotation.set(GeometryUtils.degToRad(x), GeometryUtils.degToRad(y), GeometryUtils.degToRad(z));
    }
    
    public setXRotationSpeed(rotationSpeed: number): void {
        this._xRotationSpeed = rotationSpeed;
    }

    public setYRotationSpeed(rotationSpeed: number): void {
        this._yRotationSpeed = rotationSpeed;
    }

    public setZRotationSpeed(rotationSpeed: number): void {
        this._zRotationSpeed = rotationSpeed;
    }

    public setCalculatedWidth(width: number): Promise<void> {
        this._setRadius = width;

        return new Promise((resolve) => {
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
    }

    public disableLayouts(): void {
    }

    ////////// Public Methods

    // --- Data Methods

    public addChildElement(position: number, childElement: SceneElement): void {
    }

    public startAnimation(): void {
        if (this._animationMixer) {
            this._action.play();
        }
    }

    public stopAnimation(): void {
        if (this._animationMixer) {
            this._action.stop();
        }
    }

    // --- Rendering Methods

    public async draw(): Promise<void> {
        return new Promise(async (resolve) => {
            resolve();
        });
    }

    public clicked(meshId: string): Promise<void> {
        return new Promise((resolve) => {
            if (this._loadedAsset && MeshUtils.ObjectContainsUid(meshId, this._loadedAsset) && (this.onClick)) {
                this.onClick();
            }

            resolve();
        });
    }

    public update(delta: number): void {
        if (this._animationMixer) {
            if (this._xRotationSpeed > 0) this._loadedAssetContainer.rotation.x += GeometryUtils.degToRad(this._xRotationSpeed);
            if (this._yRotationSpeed > 0) this._loadedAssetContainer.rotation.y += GeometryUtils.degToRad(this._yRotationSpeed);
            if (this._zRotationSpeed > 0) this._loadedAssetContainer.rotation.z += GeometryUtils.degToRad(this._zRotationSpeed);

            this._animationMixer.update(delta);
        }
    }

    ////////// Private Methods

    private drawShapingCube(): Mesh {
        const geometry = new BoxGeometry(this._radius, this._radius, 1);
        const material = MaterialUtils.getBasicMaterial( {
            color: 0x000000,
            transparent: true,
            opacity: 0
        } );

        const mesh = new Mesh( geometry, material );
        mesh.invisible = true;

        return mesh;
    }
}