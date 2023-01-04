import { 
    MeshBasicMaterial,
    PlaneGeometry,
    Mesh,
    Vector3,
    Box3,
    CanvasTexture,
    LinearFilter,
    VideoTexture,
    PolyhedronGeometry,
    Color,
    DoubleSide,
    Group
} from 'three';

import { Dimensions } from '../../geometry/Dimensions';
import { MeshUtils } from '../../geometry/MeshUtils';
import { MainScene } from '../../scene/MainScene';
import { SceneElementPlacement } from '../../scene/SceneElementPlacement';

import { SceneElement } from "../SceneElement";
import { VRLayout } from '../vr-layout/VRLayout';
import { VRVideoConfig } from './VRVideoConfig';

export class VRVideo implements SceneElement {
    private _depth: number;

    private _parent: SceneElement;

    private _uuid: string;

    private _src: string;

    private _initialWidth: number; //Defined width from the HTML tag
    private _initialHeight: number;

    private _setWidth?: number = null; // Set through the API, typically through a parent div

    private _calculatedHeight: number;

    private _video: HTMLVideoElement;
    private _videoStarted: boolean = false;
    private _isVideoPlaying: boolean = false;

    private _playInline: boolean;

    private _placeholderTimestamp: number;

    private _mesh?: Mesh = null;
    private _playButton?: Mesh = null;

    private _content?: Group = new Group();
    private _initialized: boolean = false;

    public onClick?: Function = null;

    constructor(depth: number, parent: SceneElement, src: string, config: VRVideoConfig) {
        this._depth = depth;

        this._parent = parent;

        this._uuid = MeshUtils.generateId();
        
        this._src = src;

        this._playInline = config.playInline;

        this._initialWidth = config.width;
        this._initialHeight = config.height;

        this._placeholderTimestamp = config.placeholderTimestamp;
        
        this._content.translateZ(0.5);
    }

    ////////// Getters
    
    public getUUID(): string {
        return this._uuid;
    }
    
    public getPlacementLocation(): SceneElementPlacement {
        return SceneElementPlacement.Main;
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
            width: this._initialWidth,
            height: this._calculatedHeight
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

    public async setWidth(width: number): Promise<void> {
        this._setWidth = width;

        return this.draw();
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
            if (this._mesh && (this._mesh.uuid === meshId)) {
                if (this._playInline) {
                    if (!this._isVideoPlaying) {
                        if (!this._videoStarted) {
                            this._video.currentTime = 0;
                            this._videoStarted = true;
                        }
                        
                        this._video.play();
                        this._isVideoPlaying = true;

                        this._playButton.visible = false;
                    }
                    else {
                        this._video.pause();
                        this._isVideoPlaying = false;

                        this._playButton.visible = true;
                    }
                }

                if (this.onClick) this.onClick();
            }

            resolve();
        });
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

            if (this._playButton) {
                this._playButton.geometry.dispose();
                this._playButton.material.dispose();
                this._playButton = null;
            }

            this._mesh = await this.buildMesh(width);
            this._playButton = this.buildPlayButton();

            this._content.add(this._mesh);
            this._content.add(this._playButton);

            resolve();
        });
    }

    private async buildTexture(width: number): Promise<CanvasTexture> {
        var that = this;

        return new Promise(async (resolve) => {
            this._calculatedHeight = this._initialHeight;

            this._video = document.createElement("video");
            this._video.setAttribute("loop", "");
            this._video.setAttribute("crossOrigin", "anonymous");
            this._video.setAttribute("playsinline", "");
            
            this._video.addEventListener( "loadedmetadata", function (e) {
                const videoTexture = new VideoTexture(that._video);
    
                if (that._initialHeight) {
                    that._calculatedHeight = that._initialHeight;
                }
                else if (width) {
                    const widthRatio = videoTexture.image.videoWidth/width;
    
                    that._calculatedHeight = videoTexture.image.videoHeight/widthRatio;
                }
                else {
                    that._calculatedHeight = 0;
                }
    
                resolve(videoTexture);
            }, false );

            const videoSource = document.createElement("source");
            videoSource.src = this._src + "#t=" + this._placeholderTimestamp;

            this._video.appendChild(videoSource);
        });
    }

    private async buildMesh(width: number): Promise<Mesh> {
        return new Promise(async (resolve) => {
            const imageTexture = await this.buildTexture(width);

            const geometry = new PlaneGeometry(width, this._calculatedHeight);
            const material = new MeshBasicMaterial({
                map: imageTexture,
                transparent: false,
                side: DoubleSide
            });
            
            const mesh = new Mesh(geometry, material);
            mesh.recieveShadow = true;
            
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

        const geometry = new PolyhedronGeometry(vertices, faces, this._calculatedHeight/2, 0);
        
        const material = new MeshBasicMaterial({
            color: new Color("#ffffff"),
            transparent: false,
            side: DoubleSide
        });

        const playMesh =  new Mesh(geometry, material);
        playMesh.invisible = true;

        const playMeshBox = new Box3().setFromObject(playMesh);

        playMesh.position.y -= (playMeshBox.max.y-playMeshBox.min.y)/2;
        playMesh.position.x -= (playMeshBox.max.x-playMeshBox.min.x)/2;
        this._content.translateZ(this._depth+1);

        return playMesh;
    }
}