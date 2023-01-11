import { 
    PerspectiveCamera,
    Vector3,
    MathUtils,
    Scene,
    Box3
} from 'three';
import { SceneElement } from '../components/SceneElement';

export class Camera {
    private _scene: Scene;

    private _container: HTMLDivElement;

    private _basePlaneWidth: number;

    private _camera: PerspectiveCamera;

    private _placeElements: Array<SceneElement> = new Array<SceneElement>();
    private _attachedElements: Array<SceneElement> = new Array<SceneElement>();

    constructor(container: HTMLDivElement, scene: Scene, basePlaneWidth: number) {
        this._scene = scene;

        this._container = container;
        
        this._basePlaneWidth = basePlaneWidth;

        this.buildCamera();
    }

    // Elements that are actually placed at the camera
    public async addElementAtCamera(element: SceneElement): Promise<void> {
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
    public async addElementToCamera(element: SceneElement): Promise<void> {
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

    public async updateCameraElementPosition(element: SceneElement): Promise<void> {
        return new Promise(async (resolve) => {
            const elementContent = await element.getContent();
            const elementPosition = await element.getPosition();
            
            elementContent.position.set(0, 0, 0);
            
            elementContent.translateZ(elementPosition.z*-1);
            elementContent.translateX(elementPosition.x);
            
            var vFOV = MathUtils.degToRad(this._camera.fov);
            var height = 2 * Math.tan( vFOV / 2 ) * elementPosition.z;

            elementContent.translateY(((height/2)*-1) + (element.getDimensions().height/2) + elementPosition.y);
            
            resolve();
        });
    }

    public getCamera(): PerspectiveCamera {
        return this._camera;
    }

    public getPosition(): Vector3 {
        return this._camera.position;
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
        const fov = 75;
        const aspect = (this._container.clientWidth/this._container.clientHeight);
        const far = this._basePlaneWidth*3;
        
        this._camera = new PerspectiveCamera(fov, aspect, 0.1, far);

        this._scene.add(this._camera);
    }
}