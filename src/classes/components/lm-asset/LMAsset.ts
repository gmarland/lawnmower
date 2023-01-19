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
import { ISceneElement } from "../ISceneElement";
import { LMAssetConfig } from './LMAssetConfig';
import { AssetLoader } from './AssetLoader';
import { SceneElementPlacement } from '../../scene/SceneElementPlacement';
import { MaterialUtils } from '../../geometry/MaterialUtils';
import { AssetUtils } from './AssetUtils';
import { BaseSceneElement } from '../BaseSceneElement';
import { LMLayout } from '../lm-layout/LMLayout';
import { MainScene } from '../../scene/MainScene';

export class LMAsset extends BaseSceneElement implements ISceneElement {
    private _src: string;

    private _reloadSrc: boolean = true;

    private _loadedAsset?: Group = null;

    private _animations: Array<AnimationClip>;

    private _activeAnimation: string;

    private _animationMixer: AnimationMixer;

    private _action;

    private _loadedAssetContainer?: Group =new Group();

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

    constructor(parent: ISceneElement, position: Vector3, id: string, src: string, config: LMAssetConfig) {
        let offset = null;
        if (config.offset) offset = config.offset;
        
        super(parent, config.shadowsEnabled, position, id, offset);

        this._src = src;

        this._activeAnimation = config.activeAnimation;

        this._radius = config.radius;

        this._xRotation = config.xRotation;
        this._yRotation = config.yRotation;
        this._zRotation = config.zRotation;

        this._xRotationSpeed = config.xRotationSpeed;
        this._yRotationSpeed = config.yRotationSpeed;
        this._zRotationSpeed = config.zRotationSpeed;
    }

    ////////// Getters

    public get placementLocation(): SceneElementPlacement {
        return SceneElementPlacement.Main;
    }

    public get dimensions(): Dimensions {
        return {
            width: this._radius,
            height: this._radius
        };
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

    public get animationNames(): Array<string> {
        const animationNames = new Array<string>();

        for (let i=0; i<this._animations.length; i++) {
            animationNames.push(this._animations[i].name);
        } 

        return animationNames;
    }

    ////////// Setters

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
    
    ////////// Public Methods

    // --- Animation Methods

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
    
    public setRotation(x: number, y: number, z: number): void {
        this._loadedAssetContainer.rotation.set(GeometryUtils.degToRad(x), GeometryUtils.degToRad(y), GeometryUtils.degToRad(z));
    }

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

    public getChildSceneElements(): ISceneElement[] {
        return [];
    }

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

    // --- Content Methods
    
    public async getPosition(): Promise<Vector3> {
        return new Promise(async (resolve) => {
            if (!this.content) await this.getContent(); 
    
            resolve(this.content.position);
        });
    }

    public getContent(): Promise<Group> {
        return new Promise(async (resolve) => {
            await this.draw();

            resolve(this.content);
        });
    }

    public async drawParent(): Promise<void> {
        const updatedDimensions = await this.parent.draw();
        if (updatedDimensions || (this.parent instanceof LMLayout)) await this.parent.drawParent();
    }

    public async draw(): Promise<boolean> {
        return new Promise(async (resolve) => {
            if (!this._drawing) {
                this._drawing = true;
                this._redraw = false;

                const currentDimensions = GeometryUtils.getDimensions(this.content);

                await this.generateContent(this.width);
                    
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
            if (this.parent && this.parent.removeChildElement) this.parent.removeChildElement(this);

            if (this._loadedAsset) {
                this._loadedAsset.clear();
                this._loadedAsset = null;
            }

            if (this._loadedAssetContainer) {
                this._loadedAssetContainer.clear();
                this._loadedAssetContainer = null;
            }
            if (this.content) {
                this.content.clear();
                this.content = null;
            } 

            resolve();
        });
    }

    ////////// Private Methods

    private generateContent(width: number): Promise<void> {
        return new Promise(async (resolve) => {
            this.content.clear();
            this._loadedAssetContainer.clear();

            if ((!this._loadedAsset)|| (this._reloadSrc)) {
                this._reloadSrc = false
    
                if (this._action) this._action.stop();

                this._loadedAsset = null;
                
                await new Promise<void>((resolve): void => {
                    new AssetLoader().load(this._src).then((loadedAssetDetail) => {
                        this._loadedAsset = loadedAssetDetail.element;
                        
                        if (this.shadowsEnabled) {
                            if ((this.parent && (this.parent instanceof MainScene)) || ((this.offset != null) && (this.offset !== 0))) this._loadedAsset.castShadow = true;
                            else this._loadedAsset.castShadow = false;

                            this._loadedAsset.receiveShadow = true;
                        }
                        else {
                            this._loadedAsset.receiveShadow = false;
                            this._loadedAsset.castShadow = false;
                        }
    
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
            
            this.content.add(this._loadedAssetContainer);
            this.content.add(this.drawShapingCube(width));
            
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