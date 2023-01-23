import { 
    Scene,
    WebGLRenderer,
    WebGLRenderTarget,
    PCFSoftShadowMap
} from 'three';

import { SceneCamera } from './SceneCamera';
import { RenderCamera } from './RenderCamera';

export class Renderer {
    private _vrEnabled: boolean;

    private _renderer: WebGLRenderer;

    private _container: HTMLDivElement;

    private _shadowsEnabled: boolean;

    private _skyboxColor: number;
    private _skyboxOpacity: number;

    constructor(vrEnabled: boolean, camera: SceneCamera, container: HTMLDivElement, shadowsEnabled: boolean, skyboxColor: number, skyboxOpacity: number) {
        this._vrEnabled = vrEnabled;

        this._container = container;

        this._shadowsEnabled = shadowsEnabled;

        this._skyboxColor = skyboxColor;
        this._skyboxOpacity = skyboxOpacity;

        this._renderer = new WebGLRenderer({ 
            powerPreference: this._vrEnabled ? "high-performance" : "default",
            antialias: true, 
            alpha: true,
            logarithmicDepthBuffer: true,
            colorManagement: true,
            sortObjects: true 
        });

        if (this._vrEnabled) {
            this._renderer.xr.enabled = true;
        }

        this._renderer.setSize(this._container.clientWidth, this._container.clientHeight);
        this._renderer.setClearColor(this._skyboxColor, this._skyboxOpacity);
        this._renderer.setPixelRatio(window.devicePixelRatio);

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

    public setRenderedTarget(target: WebGLRenderTarget) {
        this._renderer.setRenderTarget(target);
    }

    public render(scene: Scene, renderCamera: SceneCamera | RenderCamera): void {
        this._renderer.render(scene, renderCamera.camera);
    }

    public getController(controllerNumber: number): any {
        return this._renderer.xr.getController(controllerNumber);
    }

    public getControllerGrip(controllerNumber: number): any {
        return this._renderer.xr.getControllerGrip(controllerNumber);
    }
}