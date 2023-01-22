import { 
    Mesh,
    Object3D,
    Vector3,
    CanvasTexture,
    VideoTexture,
    Group,
    MeshBasicMaterial,
    SphereGeometry
} from 'three';

import { Dimensions } from "../../geometry/Dimensions";
import { GeometryUtils } from '../../geometry/GeometryUtils';
import { MeshUtils } from '../../geometry/MeshUtils';
import { MainScene } from '../../scene/MainScene';
import { SceneElementPlacement } from '../../scene/SceneElementPlacement';
import { BaseSceneElement } from '../BaseSceneElement';
import { ISceneElement } from "../ISceneElement";
import { LMLayout } from '../lm-layout/LMLayout';
import { LM360VideoConfig } from './LM360VideoConfig';

export class LM360Video extends BaseSceneElement implements ISceneElement {
    private _vrEnabled: boolean;

    private _src: string;

    private _videoRadius: number;
    private _videoWidthSegments: number;
    private _videoHeightSegments: number;

    private _setVideoRadius?: number = null;

    private _video: HTMLVideoElement;
    private _videoStarted: boolean = false;
    private _isVideoPlaying: boolean = false;

    private _mesh?: Object3D = null;
    
    private _drawing: boolean = false;
    private _redraw: boolean = false;

    public onClick?: Function = null;

    public onPlay?: Function = null;

    constructor(parent: ISceneElement, position: Vector3, id: string, src: string, config: LM360VideoConfig) {
        let offset = null;
        if (config.offset) offset = config.offset;
        
        super(parent, config.shadowsEnabled, position, id, offset);

        this._vrEnabled = config.vrEnabled;

        this._src = src;
        
        this._videoRadius = config.videoRadius;
        this._videoWidthSegments = config.videoWidthSegments;
        this._videoHeightSegments = config.videoHeightSegments;
        
        this.content.visible = false;
    }

    ////////// Getters
    
    public get placementLocation(): SceneElementPlacement {
        return SceneElementPlacement.PlacedAtCamera;
    }

    public get dimensions(): Dimensions {
        return {
            width: -1,
            height: -1
        };
    }

    public get src(): string {
        return this._src;
    }

    public get dynamicWidth(): boolean {
        return false;
    }

    public get width(): number {
        if (this._setVideoRadius !== null) return this._setVideoRadius;
        else return this._videoRadius;
    }

    public get widthSegments(): number {
        return this._videoWidthSegments;
    }

    public get heightSegments(): number {
        return this._videoHeightSegments;
    }

    public get isPlaying(): boolean {
        return this._isVideoPlaying;
    }

    ////////// Setters

    public set src(value: string) {
        this._src = value;
    }

    public set width(value: number) {
        this._setVideoRadius = value;
    }

    public set widthSegments(value: number) {
        this._videoWidthSegments = value;
    }

    public set heightSegments(value: number) {
        this._videoHeightSegments = value;
    }

    ////////// Public Methods

    // --- Video management

    public play(): void {
        if (!this._videoStarted) {
            this._video.currentTime = 0;
            this._videoStarted = true;
        }
        
        this._video.play();
        
        this._isVideoPlaying = true;
        this.content.visible = true;

        if (this.onPlay) this.onPlay();
    }

    public pause(): void {
        this._video.pause();
        this._isVideoPlaying = false;
    }

    public reset(): void  {
        this._video.pause();
        this._video.currentTime = 0;
        this._videoStarted = false;
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

    public draw(): Promise<boolean> {
        this.initialized = true;
        
        return new Promise(async (resolve) => {
            if (!this._drawing) {
                this._drawing = true;
                this._redraw = false;
                
                const currentDimensions = GeometryUtils.getDimensions(this.content);

                if (this._setVideoRadius !== null) await this.generateContent(this._setVideoRadius);
                else await this.generateContent(this._videoRadius);
                
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
            if (this._mesh && MeshUtils.ObjectContainsUid(meshId, this._mesh)) {
                if (this.onClick) this.onClick();
            }

            resolve();
        });
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

    private async generateContent(videoRadius: number): Promise<void> {
        return new Promise(async (resolve) => {
            this.content.clear();

            this.destroyMesh();
            
            this._mesh = await this.buildMesh(videoRadius);
            this._mesh.receiveShadow = true;
            
            this.content.add(this._mesh);

            resolve();
        });
    }

    private async buildTexture(): Promise<CanvasTexture> {
        var that = this;

        return new Promise(async (resolve) => {
            this._video = document.createElement("video");
            this._video.setAttribute("loop", "");
            this._video.setAttribute("crossOrigin", "anonymous");
            this._video.setAttribute("playsinline", "");
            
            this._video.addEventListener( "loadedmetadata", function (e) {
                const videoTexture = new VideoTexture(that._video);
    
                resolve(videoTexture);
            }, false );

            const videoSource = document.createElement("source");
            videoSource.src = this._src;

            this._video.appendChild(videoSource);
        });
    }

    private async buildMesh(videoRadius: number): Promise<Object3D> {
        return new Promise(async (resolve) => {
            const videoLayout = new Object3D();

            const imageTexture = await this.buildTexture();

            // left

            const geometry1 = new SphereGeometry(videoRadius, this._videoWidthSegments, this._videoHeightSegments);

            // invert the geometry on the x-axis so that all of the faces point inward
            geometry1.scale( - 1, 1, 1 );

            const uvs1 = geometry1.attributes.uv.array;

            for ( let i = 0; i < uvs1.length; i += 2 ) {
                uvs1[ i ] *= 0.5;
            }

            const material1 = new MeshBasicMaterial({ 
                map: imageTexture
            });

            const mesh1 = new Mesh( geometry1, material1 );
            mesh1.rotation.y = - Math.PI / 2;
            
            videoLayout.add( mesh1 );

            // right

            const geometry2 = new SphereGeometry(videoRadius, this._videoWidthSegments, this._videoHeightSegments);
            geometry2.scale( - 1, 1, 1 );

            const uvs2 = geometry2.attributes.uv.array;

            for ( let i = 0; i < uvs2.length; i += 2 ) {
                uvs2[ i ] *= 0.5;
                uvs2[ i ] += 0.5;
            }

            const material2 = new MeshBasicMaterial({ 
                map: imageTexture   
            });

            const mesh2 = new Mesh( geometry2, material2 );
            mesh2.rotation.y = - Math.PI / 2;

            videoLayout.add( mesh2 );
    
            resolve(videoLayout);
        });
    }

    private destroyMesh(): void {
        if (this._mesh) {
            if (this._mesh) {
                if (this._mesh.children[0]) {
                    if (this._mesh.children[0].geometry) this._mesh.children[0].geometry.dispose();
                    if (this._mesh.children[0].material) this._mesh.children[0].material.dispose();
                }
                if (this._mesh.children[1]) {
                    if (this._mesh.children[1].geometry) this._mesh.children[1].geometry.dispose();
                    if (this._mesh.children[1].material) this._mesh.children[1].material.dispose();
                }
            }
            if (this._mesh.geometry) this._mesh.geometry.dispose();
            if (this._mesh.material) this._mesh.material.dispose();
            
            this._mesh = null;
        }
    }
}