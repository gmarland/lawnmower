import { 
    Scene,
    DirectionalLight,
    AmbientLight
} from 'three';

import { SceneCamera } from './Camera/SceneCamera';

export class Lighting {
    private _scene: Scene;

    private _camera: SceneCamera;

    private _shadowsEnabled: boolean;

    private _light: DirectionalLight;

    private _ambientLight: AmbientLight;

    constructor(scene: Scene, camera: SceneCamera, shadowsEnabled: boolean) {
        this._scene = scene;

        this._camera = camera;

        this._shadowsEnabled = shadowsEnabled;

        if (this._shadowsEnabled) {        
            this._ambientLight = new AmbientLight(0xffffff, 0.2);
            this._scene.add(this._ambientLight);
    
            this._light = new DirectionalLight(0xffffff, 0.8);
    
            this._light.castShadow = true;

            this.updateShadowDistance();

            this._camera.addLightToCamera(this._light);
        }
        else {
            this._ambientLight = new AmbientLight(0xffffff, 1);  
            this._scene.add(this._ambientLight);
        }
    }

    public updateShadowDistance(): void {
        this._light.shadow.camera.top = this._camera.far;
        this._light.shadow.camera.bottom = this._camera.far*-1;
        this._light.shadow.camera.left = this._camera.far*-1;
        this._light.shadow.camera.right = this._camera.far;
        this._light.shadow.camera.near = this._camera.near;
        this._light.shadow.camera.far = this._camera.far;
    }
}