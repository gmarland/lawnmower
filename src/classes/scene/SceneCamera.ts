import { 
    PerspectiveCamera,
    Vector3,
    MathUtils,
    Scene,
    DirectionalLight
} from 'three';

import { ISceneElement } from '../components/ISceneElement';

export class SceneCamera {
    private _scene: Scene;

    private _shadowsEnabled: boolean;

    private _container: HTMLDivElement;

    private _camera: PerspectiveCamera;
    private _light: DirectionalLight;

    private _placeElements: Array<ISceneElement> = new Array<ISceneElement>();
    private _attachedElements: Array<ISceneElement> = new Array<ISceneElement>();

    private _fov: number = 75;
    private _aspect: number;
    private _near: number = 0.1;
    private _far: number;

    constructor(container: HTMLDivElement, scene: Scene, shadowsEnabled: boolean, defaultSceneRadius: number) {
        this._scene = scene;

        this._shadowsEnabled = shadowsEnabled;

        this._container = container;
        
        this._far = defaultSceneRadius*2;

        this.buildCamera();
    }

    public get camera(): PerspectiveCamera {
        return this._camera;
    }

    public get position(): Vector3 {
        return this._camera.position;
    }
 
    public get fov(): number {
        return this._fov;
    }
 
    public get aspect(): number {
        return this._aspect;
    }
 
    public get near(): number {
        return this._near
    }
 
    public get far(): number {
        return this._far;
    }

    public set far(value: number) {
        this._far = value;

        this._camera.far = this._far;
        this._camera.updateProjectionMatrix();

        if (this._shadowsEnabled && this._light) this._light.updateShadowDistance();
    }

    public addLightToCamera(light: DirectionalLight) {
        this._light = light;

        this._camera.add(this._light);

        this._light.position.set(0,0,1);
        this._light.target = this._camera;
    }

    // Elements that are actually placed at the camera
    public async addElementAtCamera(element: ISceneElement): Promise<void> {
        return new Promise(async (resolve) => {
            this._placeElements.push(element);

            const elementContent = await element.getContent();
            const elementPosition = await element.getPosition();

            this._scene.add(elementContent);
            
            elementContent.name = "placedAtCamera";
            elementContent.translateZ(this._camera.position.z + elementPosition.z);

            resolve();
        });
    }

    // Elements that are actually attached to the camera
    public async addElementToCamera(element: ISceneElement): Promise<void> {
        return new Promise(async (resolve) => {
            this._attachedElements.push(element);

            const elementContent = await element.getContent();

            this._scene.add(elementContent);
            this._camera.add(elementContent);
            
            elementContent.name = "attachedToCamera";

            await this.updateCameraElementPosition(element);

            resolve();
        });
    }

    public async updateCameraElementPosition(element: ISceneElement): Promise<void> {
        return new Promise(async (resolve) => {
            const elementContent = await element.getContent();
            const elementPosition = await element.getPosition();
            
            elementContent.position.set(0, 0, 0);
            
            elementContent.translateZ(elementPosition.z*-1);
            elementContent.translateX(elementPosition.x);
            
            var vFOV = MathUtils.degToRad(this._camera.fov);
            var height = 2 * Math.tan( vFOV / 2 ) * elementPosition.z;

            elementContent.translateY(((height/2)*-1) + (element.dimensions.height/2) + elementPosition.y);
            
            resolve();
        });
    }

    public setPosition(x: number, y: number, z: number): void {
        this._camera.position.set(x, y, z);
    }

    public setLookAt(x: number, y: number, z: number) {
        this._camera.lookAt(new Vector3(x, y, z));
    }

    public resize(): void {
        this._camera.aspect = (this._container.clientWidth/this._container.clientHeight);
        this._camera.updateProjectionMatrix();
    }

    private buildCamera(): void {
        this._fov = 75;
        this._aspect = (this._container.clientWidth/this._container.clientHeight);
        
        this._camera = new PerspectiveCamera(this._fov, this._aspect, this._near, this._far);

        this._scene.add(this._camera);
    }

    public Update(): void {
    }
}