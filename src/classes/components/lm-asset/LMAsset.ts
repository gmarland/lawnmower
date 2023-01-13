import { 
    AnimationMixer,
    Group,
    AnimationClip,
    BoxGeometry,
    Mesh,
    Vector3
} from 'three';

import { Dimensions } from "../../geometry/Dimensions";
import { GeometryUtils } from '../../geometry/GeometryUtils';
import { MeshUtils } from '../../geometry/MeshUtils';
import { SceneElement } from "../SceneElement";
import { LMAssetConfig } from './LMAssetConfig';
import { AssetLoader } from './AssetLoader';
import { SceneElementPlacement } from '../../scene/SceneElementPlacement';
import { MaterialUtils } from '../../geometry/MaterialUtils';
import { LMLayout } from '../lm-layout/LMLayout';
import { MainScene } from '../../scene/MainScene';
import { AssetUtils } from './AssetUtils';

export class LMAsset implements SceneElement {
    private _parent: SceneElement;

    private _id: string;

    private _src: string;
    private _reloadSrc: boolean = true;

    private _loadedAsset?: Group = null;

    private _animations: Array<AnimationClip>;

    private _activeAnimation: string;

    private _animationMixer: AnimationMixer;

    private _action;

    private _loadedAssetContainer?: Group =new Group();
    private _content: Group = new Group();

    private _xRotation: number; 
    private _yRotation: number; 
    private _zRotation: number;

    private _radius: number; 
    private _setRadius?: number = null;

    private _xRotationSpeed: number = 0;
    private _yRotationSpeed: number = 0;
    private _zRotationSpeed: number = 0;
    
    private _drawing: boolean = false;
    private _redraw: boolean = false;

    public onClick?: Function = null;

    constructor(parent: SceneElement, id: string, src: string, assetConfig: LMAssetConfig) {
        this._parent = parent;

        this._id = id;

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
    
    public get id(): string {
        return this._id;
    }
    
    public get uuid(): string {
        return this._content.uuid;
    }

    public get dynamicWidth(): boolean {
        return false;
    }

    public get src(): string {
        return this._src;
    }
    
    public get width(): number {
        if (this._setRadius !== null) return this._setRadius;
        else return this._radius;
    }

    public get xRotation(): number {
        return GeometryUtils.radToDeg(this._loadedAssetContainer.rotation.x);
    }

    public get yRotation(): number {
        return GeometryUtils.radToDeg(this._loadedAssetContainer.rotation.y);
    }

    public get zRotation(): number {
        return GeometryUtils.radToDeg(this._loadedAssetContainer.rotation.z);
    }
    
    public get xRotationSpeed(): number {
        return this._xRotationSpeed;
    }

    public get yRotationSpeed(): number {
        return this._yRotationSpeed;
    }

    public get zRotationSpeed(): number {
        return this._zRotationSpeed;
    }

    public get activeAnimation(): string {
        return this._activeAnimation;
    }

    public get visible(): boolean {
        return this._content.visible;
    }
    
    public getPlacementLocation(): SceneElementPlacement {
        return SceneElementPlacement.Main;
    }

    public getContent(): Promise<Group> {
        return new Promise(async (resolve) => {
            await this.draw();

            resolve(this._content);
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

    public getChildSceneElements(): SceneElement[] {
        return [];
    }

    public getIsChildElement(uuid: string): boolean {
        return uuid === this.uuid;
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

    public set id(value: string) {
        this._id = value;
    }

    public set src(value: string) {
        this._src = value;
        this._reloadSrc = true;
    }

    public set width(value: number) {
        this._setRadius = value;
    }

    public set xRotation(value: number) {
        this._xRotation = value;
        this._loadedAssetContainer.rotation.set(GeometryUtils.degToRad(this._xRotation), GeometryUtils.degToRad(this._yRotation), GeometryUtils.degToRad(this._zRotation));
    }

    public set yRotation(value: number) {
        this._yRotation = value;
        this._loadedAssetContainer.rotation.set(GeometryUtils.degToRad(this._xRotation), GeometryUtils.degToRad(this._yRotation), GeometryUtils.degToRad(this._zRotation));
    }

    public set zRotation(value: number) {
        this._zRotation = value;
        this._loadedAssetContainer.rotation.set(GeometryUtils.degToRad(this._xRotation), GeometryUtils.degToRad(this._yRotation), GeometryUtils.degToRad(this._zRotation));
    }
    
    public set xRotationSpeed(value: number) {
        this._xRotationSpeed = value;
    }

    public set yRotationSpeed(value: number) {
        this._yRotationSpeed = value;
    }

    public set zRotationSpeed(value: number) {
        this._zRotationSpeed = value;
    }

    public set activeAnimation(animationName: string) {
        this._activeAnimation = animationName;
        
        this.stopAnimation();
        this._action = this._animationMixer.clipAction(AnimationClip.findByName(this._animations, this._activeAnimation));
        this.startAnimation();
    }

    public set visible(value: boolean) {
        this._content.visible = value;
    }
    
    public setRotation(x: number, y: number, z: number): void {
        this._loadedAssetContainer.rotation.set(GeometryUtils.degToRad(x), GeometryUtils.degToRad(y), GeometryUtils.degToRad(z));
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

    public addChildElement(position: number, childElement: SceneElement): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    public removeChildElement(childElement: SceneElement): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
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

    public async draw(): Promise<boolean> {
        return new Promise(async (resolve) => {
            if (!this._drawing) {
                this._drawing = true;
                this._redraw = false;

                const currentDimensions = GeometryUtils.getDimensions(this._content);

                await this.generateContent(this.width);
                    
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
        if (updatedDimensions || (this._parent instanceof LMLayout)) await this._parent.drawParent();
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

    public destroy(): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    ////////// Private Methods

    private generateContent(width: number): Promise<void> {
        return new Promise(async (resolve) => {
            this._content.clear();
            this._loadedAssetContainer.clear();

            if ((!this._loadedAsset)|| (this._reloadSrc)) {
                this._reloadSrc = false
    
                if (this._action) this._action.stop();

                this._loadedAsset = null;
                
                await new Promise<void>((resolve): void => {
                    new AssetLoader().load(this._src).then((loadedAssetDetail) => {
                        this._loadedAsset = loadedAssetDetail.element;
                        this._loadedAsset.recieveShadow = true;
    
                        this._animations = loadedAssetDetail.animations;

                        resolve();
                    });
                });
            }

            AssetUtils.resetAssetMesh(this._loadedAsset);
            AssetUtils.resizeAssetMesh(this._loadedAsset, width);

            if (this._animations && (this._animations.length > 0)) {
                this._animationMixer = new AnimationMixer(this._loadedAsset);

                if (this._activeAnimation) {
                    const animationClip = AnimationClip.findByName(this._animations, this._activeAnimation);

                    if (animationClip) {
                        this._action = this._animationMixer.clipAction(animationClip);
                        this.startAnimation();
                    }
                }
            }    

            this._loadedAssetContainer.add(this._loadedAsset);
            
            this._loadedAssetContainer.rotation.set(GeometryUtils.degToRad(this._xRotation), GeometryUtils.degToRad(this._yRotation), GeometryUtils.degToRad(this._zRotation));
            
            this._content.add(this._loadedAssetContainer);
            this._content.add(this.drawShapingCube(width));
            
            resolve();
        });
    }

    private drawShapingCube(width: number): Mesh {
        const geometry = new BoxGeometry(width, width, 1);
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