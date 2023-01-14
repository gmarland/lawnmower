import { 
    Scene,
    PointLight,
    DirectionalLight,
    AmbientLight,
    Object3D
} from 'three';
import { Camera } from './Camera';

export class Lighting {
    private _scene: Scene;

    private _camera: Camera;

    private _lights: Array<PointLight> = new Array<PointLight>();

    private _ambientLight: AmbientLight;

    constructor(scene: Scene, camera: Camera) {
        this._scene = scene;

        this._camera =  camera; 

        this._ambientLight = new AmbientLight(0xffffff, 1);  
        this._scene.add(this._ambientLight);
    }

    public addLight(target: Object3D): void {
        var directionalLight = new DirectionalLight(0xffffff); 
        directionalLight.position.set(0, 0, 500);
        directionalLight.castShadow = true;
        directionalLight.target = target;

        this._lights.push(directionalLight);
        //this._camera.addLightToCamera(directionalLight)
        //this._scene.add(directionalLight);
    }

    public getLights(): Array<PointLight> {
        return this._lights;
    }

    public getAmbientLight(): AmbientLight {
        return this._ambientLight;
    }
}