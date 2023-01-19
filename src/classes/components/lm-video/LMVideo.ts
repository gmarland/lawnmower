import { 
    MeshBasicMaterial,
    Mesh,
    Vector3,
    Box3,
    CanvasTexture,
    VideoTexture,
    PolyhedronGeometry,
    Color,
    Group,
    LinearFilter
} from 'three';

import { Dimensions } from '../../geometry/Dimensions';
import { GeometryUtils } from '../../geometry/GeometryUtils';
import { MaterialUtils } from '../../geometry/MaterialUtils';
import { PlaneUtils } from '../../geometry/PlaneUtils';
import { MainScene } from '../../scene/MainScene';
import { SceneElementPlacement } from '../../scene/SceneElementPlacement';
import { BaseSceneElement } from '../BaseSceneElement';

import { ISceneElement } from "../ISceneElement";
import { LMLayout } from '../lm-layout/LMLayout';
import { LMVideoConfig } from './LMVideoConfig';

export class LMVideo extends BaseSceneElement implements ISceneElement {
    private _src: string;

    private _initialWidth?: number = null; //Defined width from the HTML tag
    private _initialHeight?: number = null;

    // Set through the API, typically through a parent div
    private _setWidth?: number = null;
    private _setHeight?: number = null;

    private _calculatedWidth?: number = null;
    private _calculatedHeight?: number = null;

    private _video: HTMLVideoElement;
    private _videoStarted: boolean = false;
    private _isVideoPlaying: boolean = false;

    private _playInline: boolean;

    private _placeholderTimestamp: number;

    private _mesh?: Mesh = null;
    private _playButton?: Mesh = null;
    
    private _drawing: boolean = false;
    private _redraw: boolean = false;

    public onClick?: Function = null;

    constructor(parent: ISceneElement, position: Vector3, id: string, src: string, config: LMVideoConfig) {
        let offset = null;
        if (config.offset) offset = config.offset;

        super(parent, config.shadowsEnabled, position, id, offset);

        this._src = src;

        this._playInline = config.playInline;

        if (config.width) this._initialWidth = config.width;
        if (config.height) this._initialHeight = config.height;

        this._placeholderTimestamp = config.placeholderTimestamp;
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

    public get src(): string {
        return this._src;
    }

    public get playInline(): boolean {
        return this._playInline;
    }

    public get dynamicWidth(): boolean {
        return this._initialWidth == null;
    }

    public get width(): number {
        if (this._calculatedWidth !== null) return this._calculatedWidth;
        else if (this._setWidth !== null) return this._setWidth;
        else return this._initialWidth ? this._initialWidth : 0;
    }

    public get height(): number {
        if (this._calculatedHeight !== null) return this._calculatedHeight;
        else if (this._setHeight !== null) return this._setHeight;
        else return this._initialHeight ? this._initialHeight : 0;
    }

    public get placeholderTimestamp(): number {
        return this._placeholderTimestamp;
    }

    public get isPlaying(): boolean {
        return this._isVideoPlaying;
    }

    ////////// Setters

    public set src(value: string) {
        this._src = value;
    }

    public set playInline(value: boolean) {
        this._playInline = value;
    }

    public set width(value: number) {
        this._setWidth = value;
    }

    public set height(value: number) {
        this._setHeight = value;
    }

    public set placeholderTimestamp(value: number) {
        this._placeholderTimestamp = value;
    }

    ////////// Public Methods

    // ----- Video control methods

    public play(): void {
        if (!this._videoStarted) {
            this._video.currentTime = 0;
            this._videoStarted = true;
        }
        
        this._video.play();
        this._isVideoPlaying = true;

        this._playButton.visible = false;
    }

    public pause(): void {
        this._video.pause();
        this._isVideoPlaying = false;

        this._playButton.visible = true;
    }

    public reset() {
        this._video.pause();

        this._videoStarted = false;
        this._video.currentTime = 0;
    }

    // --- Layout Managment

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

    // --- Child Management

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

    // --- Rendering Methods
    
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
            if (this._mesh && (this._mesh.uuid === meshId)) {
                if (this._playInline) {
                    if (!this._isVideoPlaying) {
                        this.play();
                    }
                    else {
                        this.pause();
                    }
                }

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

    private async generateContent(width: number, height: number): Promise<void> {
        return new Promise(async (resolve) => {
            this.content.clear();

            this.destroyMesh();

            this._mesh = await this.buildMesh(width, height);
            this._playButton = this.buildPlayButton();

            this.content.add(this._mesh);
            this.content.add(this._playButton);

            resolve();
        });
    }

    private async buildTexture(width: number, height: number): Promise<CanvasTexture> {
        var that = this;

        return new Promise(async (resolve) => {
            this._calculatedHeight;
            
            this._calculatedHeight = height;
            this._calculatedWidth = width;

            this._video = document.createElement("video");
            this._video.setAttribute("loop", "");
            this._video.setAttribute("crossOrigin", "anonymous");
            this._video.setAttribute("playsinline", "");
            
            this._video.addEventListener( "loadedmetadata", function (e) {
                const videoTexture = new VideoTexture(that._video);
    
                if ((width !== null) && (width > height)) {
                    that._calculatedWidth = width;

                    const widthRatio = videoTexture.image.videoWidth/width;
    
                    that._calculatedHeight = videoTexture.image.videoHeight/widthRatio;
                }
                else if (that.height !== null) {
                    that._calculatedHeight = height;

                    const heightRatio = videoTexture.image.videoHeight/height;

                    that._calculatedWidth = videoTexture.image.videoWidth/heightRatio;
                }
                else {
                    that._calculatedWidth = 0;
                    that._calculatedWidth = 0;
                }

                videoTexture.generateMipmaps = false;
                videoTexture.minFilter = LinearFilter;
                videoTexture.magFilter = LinearFilter;
    
                resolve(videoTexture);
            }, false );

            const videoSource = document.createElement("source");
            videoSource.src = this._src + "#t=" + this._placeholderTimestamp;

            this._video.appendChild(videoSource);
        });
    }

    private async buildMesh(width: number, height: number): Promise<Mesh> {
        return new Promise(async (resolve) => {
            const imageTexture = await this.buildTexture(width, height);

            const geometry = PlaneUtils.getPlane(this._calculatedWidth, this._calculatedHeight, 0);

            const material = MaterialUtils.getBasicMaterial({
                map: imageTexture,
                transparent: false
            });
            
            const mesh = new Mesh(geometry, material);
            
            if (this.shadowsEnabled) {
                if ((this.parent && (this.parent instanceof MainScene)) || ((this.offset != null) && (this.offset !== 0))) mesh.castShadow = true;
                else mesh.castShadow = false;

                mesh.receiveShadow = true;
            }
            else {
                mesh.receiveShadow = false;
                mesh.castShadow = false;
            }
            
            resolve(mesh);
        });
    }

    private buildPlayButton(): Mesh {
        const vertices = [
            0, 1, 0,
            1, 0.5, 0,
            0, 0, 0
        ];
        
        const faces = [
            2, 1, 0
        ];

        const geometry = new PolyhedronGeometry(vertices, faces, this._calculatedHeight/2, 0)

        const material = new MeshBasicMaterial({
            color: new Color("#ffffff"),
            transparent: false
        });

        const playMesh =  new Mesh(geometry, material);
        playMesh.invisible = true;

        const playMeshBox = new Box3().setFromObject(playMesh);

        playMesh.translateX(((playMeshBox.max.x-playMeshBox.min.x)/2)*-1);
        playMesh.translateY(((playMeshBox.max.y-playMeshBox.min.y)/2)*-1);
        playMesh.translateZ(1);

        return playMesh;
    }

    private destroyMesh(): void {
        if (this._mesh) {
            this._mesh.geometry.dispose();
            this._mesh.material.dispose();
            this._mesh = null;
        }

        if (this._playButton) {
            this._playButton.geometry.dispose();
            this._playButton.material.dispose();
            this._playButton = null;
        }
    }
}