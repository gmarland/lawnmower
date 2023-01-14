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

    private _light: DirectionalLight;

    private _ambientLight: AmbientLight;

    constructor(scene: Scene, camera: Camera) {
        this._scene = scene;

        this._camera =  camera; 

        this._ambientLight = new AmbientLight(0xffffff, 0.2);  
        this._scene.add(this._ambientLight);

        this._light = new DirectionalLight(0xffffff, 0.8); 
        this._light.position.set(0, 0, 500);
        this._light.castShadow = true;

        this._camera.addLightToCamera(this._light)
    }
}