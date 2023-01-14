import { 
    Scene,
    PointLight,
    DirectionalLight,
    AmbientLight
} from 'three';

export class Lighting {
    private _scene: Scene;

    private _basePlaneWidth: number;

    private _lights: Array<PointLight> = new Array<PointLight>();

    private _ambientLight: AmbientLight;

    constructor(scene: Scene, basePlaneWidth: number) {
        this._scene = scene;

        this._basePlaneWidth =  basePlaneWidth; 

        var directionalLightCenter = new DirectionalLight(0xffffff); 
        directionalLightCenter.position.set(0, 0, 500);
        directionalLightCenter.castShadow = true;

        this._lights.push(directionalLightCenter);
        this._scene.add(directionalLightCenter);

        /*var directionalLightTop = new PointLight(0xffffff, .5); 
        directionalLightTop.position.set(0, (this._basePlaneWidth/2) + (this._voxelSize*10), 0);

        this._lights.push(directionalLightTop);
        this._scene.add(directionalLightTop);

        var directionalLightBottom = new PointLight(0xffffff, .5); 
        directionalLightBottom.position.set(0, ((this._basePlaneWidth/2)*-1) - (this._voxelSize*10), 0);

        this._lights.push(directionalLightBottom);
        this._scene.add(directionalLightBottom);

        var directionalLightFront = new PointLight(0xffffff, .25); 
        directionalLightFront.position.set(0, 0, (this._basePlaneWidth/2) + (this._voxelSize*10));

        this._lights.push(directionalLightFront);
        this._scene.add(directionalLightFront);

        var directionalLightRight = new PointLight(0xffffff, .25); 
        directionalLightRight.position.set(((this._basePlaneWidth/2) + (this._voxelSize*10)), 0, 0);

        this._lights.push(directionalLightRight);
        this._scene.add(directionalLightRight);

        var directionalLightBack = new PointLight(0xffffff, .25); 
        directionalLightBack.position.set(0, 0, (((this._basePlaneWidth/2) + (this._voxelSize*10))*-1));

        this._lights.push(directionalLightBack);
        this._scene.add(directionalLightBack);

        var directionalLightLeft = new PointLight(0xffffff, .25); 
        directionalLightLeft.position.set((((this._basePlaneWidth/2) + (this._voxelSize*10))*-1), 0, 0);

        this._lights.push(directionalLightLeft);
        this._scene.add(directionalLightLeft);

        this._ambientLight = new AmbientLight(0xffffff, 0);  
        this._scene.add(this._ambientLight);  */
    }

    public getLights(): Array<PointLight> {
        return this._lights;
    }

    public getAmbientLight(): AmbientLight {
        return this._ambientLight;
    }
}