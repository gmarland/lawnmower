import { 
    Vector3,
    OrthographicCamera
} from 'three';

export class RenderCamera {
    private _camera: OrthographicCamera;

    constructor() {
        this.buildCamera();
    }

    public get camera(): OrthographicCamera {
        return this._camera;
    }

    public get position(): Vector3 {
        return this._camera.position;
    }

    public resize(): void {
        this._camera.updateProjectionMatrix();
    }

    private buildCamera(): void {
        this._camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
    }

    public Update(): void {
    }
}