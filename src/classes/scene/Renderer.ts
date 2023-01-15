import { 
    Scene,
    WebGLRenderer,
    PCFSoftShadowMap
} from 'three';

import { Camera } from './Camera';

export class Renderer {
    private _vrEnabled: boolean;

    private _renderer: WebGLRenderer;

    private _container: HTMLDivElement;

    private _skyboxColor: number;
    private _skyboxOpacity: number;

    constructor(vrEnabled: boolean, container: HTMLDivElement, skyboxColor: number, skyboxOpacity: number) {
        this._vrEnabled = vrEnabled;

        this._container = container;

        this._skyboxColor = skyboxColor;
        this._skyboxOpacity = skyboxOpacity;

        this._renderer = new WebGLRenderer({ 
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
        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMapSoft = true;
        this._renderer.shadowMap.type = PCFSoftShadowMap;

        this._container.appendChild(this._renderer.domElement);
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

    public render(scene: Scene, camera: Camera): void {
        this._renderer.render(scene, camera.getCamera());
    }
}