import { 
    Scene,
    WebGLRenderer,
    PCFSoftShadowMap,
    Color
} from 'three';

import { SceneCamera } from './Camera/SceneCamera';

export class Renderer {
    private _vrEnabled: boolean;

    private _camera: SceneCamera;

    private _renderer: WebGLRenderer;

    private _container: HTMLDivElement;

    private _shadowsEnabled: boolean;

    private _skyboxColor: string;
    private _skyboxOpacity: number;

    constructor(vrEnabled: boolean, camera: SceneCamera, container: HTMLDivElement, shadowsEnabled: boolean, skyboxColor: string, skyboxOpacity: number) {
        this._vrEnabled = vrEnabled;

        this._camera = camera;

        this._container = container;

        this._shadowsEnabled = shadowsEnabled;

        this._skyboxColor = skyboxColor;
        this._skyboxOpacity = skyboxOpacity;

        this._renderer = new WebGLRenderer({ 
            powerPreference: this._vrEnabled ? "high-performance" : "default",
            antialias: true,
        });

        //this._renderer.autoClear = false;

        if (this._vrEnabled) {
            this._renderer.xr.enabled = true;
        }

        this._renderer.setSize(this._container.clientWidth, this._container.clientHeight);
        this._renderer.setClearColor(new Color(this._skyboxColor), this._skyboxOpacity);
        
        this._renderer.setPixelRatio(2);

        if (this._shadowsEnabled) {
            this._renderer.shadowMap.enabled = true;
            this._renderer.shadowMapSoft = true;
            this._renderer.shadowMap.type = PCFSoftShadowMap;
            this._renderer.shadowCameraNear = 3;
            this._renderer.shadowCameraFar = camera.far;
            this._renderer.shadowCameraFov = camera.fov;
        }

        this._container.appendChild(this._renderer.domElement);
    }

    public get domElement(): any {
        return this._renderer.domElement;
    }

    public get webGLRenderer(): WebGLRenderer {
        return this._renderer;
    }

    public setAnimationLoop(func: Function) {
        this._renderer.setAnimationLoop(func);
    }

    public resize() {
        this._renderer.setSize(this._container.clientWidth, this._container.clientHeight);
    }

    public render(scene: Scene, sceneCamera: SceneCamera): void {
        this._renderer.render(scene, sceneCamera.camera);
    }

    public getController(controllerNumber: number): any {
        return this._renderer.xr.getController(controllerNumber);
    }

    public getControllerGrip(controllerNumber: number): any {
        return this._renderer.xr.getControllerGrip(controllerNumber);
    }
}