import { 
    Mesh,
    Object3D,
    Vector3,
    CanvasTexture,
    VideoTexture,
    DoubleSide,
    Group,
    MeshBasicMaterial,
    SphereGeometry
} from 'three';

import { Dimensions } from "../../geometry/Dimensions";
import { GeometryUtils } from '../../geometry/GeometryUtils';
import { MeshUtils } from '../../geometry/MeshUtils';
import { MainScene } from '../../scene/MainScene';
import { SceneElementPlacement } from '../../scene/SceneElementPlacement';
import { SceneElement } from "../SceneElement";
import { VRLayout } from '../vr-layout/VRLayout';
import { VR360VideoConfig } from './VR360VideoConfig';

export class VR360Video implements SceneElement {
    private _parent: SceneElement;

    private _uuid: string;

    private _src: string;

    private _videoRadius: number;
    private _videoWidthSegments: number;
    private _videoHeightSegments: number;

    private _setVideoRadius?: number = null;

    private _video: HTMLVideoElement;
    private _videoStarted: boolean = false;
    private _isVideoPlaying: boolean = false;

    private _mesh?: Object3D = null;

    private _content: Object3D = new Object3D();
    
    private _initialized: boolean = false;
    
    private _drawing: boolean = false;
    private _redraw: boolean = false;

    public onClick?: Function = null;

    public onPlay?: Function = null;

    constructor(parent: SceneElement, src: string, config: VR360VideoConfig) {
        this._uuid = MeshUtils.generateId();

        this._videoRadius = config.videoRadius;
        this._videoWidthSegments = config.videoWidthSegments;
        this._videoHeightSegments = config.videoHeightSegments;

        this._parent = parent;
        
        this._src = src;
        
        this._content.visible = false;
    }

    ////////// Getters
    
    public get uuid(): string {
        return this._uuid;
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

    public get visible(): boolean {
        return this._content.visible;
    }
    
    public getPlacementLocation(): SceneElementPlacement {
        return SceneElementPlacement.PlacedAtCamera;
    }

    public async getContent(): Promise<Group> {
        return new Promise(async (resolve) => {
            if (!this._initialized) await this.draw();

            resolve(this._content);
        });
    }

    public getIsPlaying(): boolean {
        return this._isVideoPlaying;
    }

    public getDimensions(): Dimensions {
        return {
            width: -1,
            height: -1
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
                ((this._parent as VRLayout).id == layoutId)) {
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
        this._setVideoRadius = value;
    }

    public set widthSegments(value: number) {
        this._videoWidthSegments = value;
    }

    public set heightSegments(value: number) {
        this._videoHeightSegments = value;
    }

    public set visible(value: boolean) {
        this._content.visible = value;
    }

    ////////// Public Methods

    // --- Data Methods

    public addChildElement(position: number, childElement: SceneElement): void {
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

    public play(): void {
        if (!this._videoStarted) {
            this._video.currentTime = 0;
            this._videoStarted = true;
        }
        
        this._video.play();
        
        this._isVideoPlaying = true;
        this._content.visible = true;

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

    // --- Rendering Methods

    public draw(): Promise<boolean> {
        this._initialized = true;
        
        return new Promise(async (resolve) => {
            if (!this._drawing) {
                this._drawing = true;
                this._redraw = false;
                
                const currentDimensions = GeometryUtils.getDimensions(this._content);

                if (this._setVideoRadius !== null) await this.generateContent(this._setVideoRadius);
                else await this.generateContent(this._videoRadius);
                
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

    ////////// Private Methods

    public async generateContent(videoRadius: number): Promise<void> {
        return new Promise(async (resolve) => {
            for (let i=(this._content.children.length-1); i>=0; i--) {
                this._content.remove(this._content.children[i]);
            }

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
            
            this._mesh = await this.buildMesh(videoRadius);
            this._mesh.recieveShadow = true;
            
            this._content.add(this._mesh);

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
                map: imageTexture,
                side: DoubleSide
            });

            const mesh1 = new Mesh( geometry1, material1 );
            mesh1.rotation.y = - Math.PI / 2;
            //mesh1.layers.set( 1 ); // display in left eye only
            
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
            //mesh2.layers.set( 2 ); // display in right eye only

            videoLayout.add( mesh2 );
    
            resolve(videoLayout);
        });
    }
}