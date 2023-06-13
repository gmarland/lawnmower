import { 
    Scene,
    WebGLRenderer,
    PCFSoftShadowMap,
    Color
} from 'three';

import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

import { SceneCamera } from './Camera/SceneCamera';

export class Renderer {
    private _vrEnabled: boolean;

    private _camera: SceneCamera;

    private _webGLRenderer: CSS3DRenderer;
    private _cssRenderer: CSS3DRenderer;

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

        this._cssRenderer = new CSS3DRenderer();

        this._cssRenderer.setSize(this._container.clientWidth, this._container.clientHeight);

        this._container.appendChild(this._cssRenderer.domElement);
        
        this._webGLRenderer = new WebGLRenderer({ 
            powerPreference: this._vrEnabled ? "high-performance" : "default",
            antialias: true,
        });

        if (this._vrEnabled) {
            this._webGLRenderer.xr.enabled = true;
        }

        this._webGLRenderer.setSize(this._container.clientWidth, this._container.clientHeight);
        this._webGLRenderer.setClearColor(new Color(this._skyboxColor), this._skyboxOpacity);
        this._webGLRenderer.setPixelRatio(2);

        if (this._shadowsEnabled) {
            this._webGLRenderer.shadowMap.enabled = true;
            this._webGLRenderer.shadowMapSoft = true;
            this._webGLRenderer.shadowMap.type = PCFSoftShadowMap;
            this._webGLRenderer.shadowCameraNear = 3;
            this._webGLRenderer.shadowCameraFar = camera.far;
            this._webGLRenderer.shadowCameraFov = camera.fov;
        }

        this._cssRenderer.domElement.appendChild(this._webGLRenderer.domElement);
    }

    public get domElement(): any {
        return this._webGLRenderer.domElement;
    }

    public get webGLRenderer(): WebGLRenderer {
        return this._webGLRenderer;
    }

    public get cssRenderer(): CSS3DRenderer {
        return this._cssRenderer;
    }

    public setAnimationLoop(func: Function) {
        this._webGLRenderer.setAnimationLoop(func);
    }

    public resize() {
        this._webGLRenderer.setSize(this._container.clientWidth, this._container.clientHeight);
    }

    public render(scene: Scene, sceneCamera: SceneCamera): void {
        this._cssRenderer.render(scene, sceneCamera.camera);
        this._webGLRenderer.render(scene, sceneCamera.camera);
    }

    public getController(controllerNumber: number): any {
        return this._webGLRenderer.xr.getController(controllerNumber);
    }

    public getControllerGrip(controllerNumber: number): any {
        return this._webGLRenderer.xr.getControllerGrip(controllerNumber);
    }
}