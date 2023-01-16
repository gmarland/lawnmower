import { 
    Scene,
    BufferGeometry,
    Vector3,
    Matrix4,
    Line,
    LineBasicMaterial,
    Raycaster
} from 'three';

import { XRControllerModelFactory } from '../../libs/three/controllers/XRControllerModelFactory.js';
import { GeometryUtils } from '../geometry/GeometryUtils.js';

import { ControllerPositionType } from "./ControllerPosition";

export class Controller {
    private _scene: Scene;

    private _position: ControllerPositionType;

    private _controller;

    private _controllerGrip;

    private _line: Line;

    private _controllerMesh;

    private _raycaster = new Raycaster();


    private _hoveredElementId?: string = null;

    private _selectClicked: boolean = false;

    constructor(scene: Scene, position: ControllerPositionType, controller, controllerSpace) {
        this._scene = scene;
        
        this._position = position;

        this._controller = controller;

        this._controllerGrip = controllerSpace;

        this.attachControllerEvents();

        this.buildController();
    }

    public get hoveredElementId(): string {
        return this._hoveredElementId;
    }

    public get selectClicked(): boolean {
        return this._selectClicked;
    }

    public set selectClicked(value: boolean) {
        this._selectClicked = value;
    }

    public update(): void {
        if (this._controller) {
            const rotationMatrix = new Matrix4();

            rotationMatrix.extractRotation(this._controller.matrixWorld);

            this._raycaster.ray.origin.setFromMatrixPosition(this._controller.matrixWorld);
            this._raycaster.ray.direction.set(0, 0, -1).applyMatrix4(rotationMatrix);

            const intersects = this._raycaster.intersectObjects(this._scene.children);
            
            if (intersects && intersects.length > 0) {
                const selectedAnchorMesh = GeometryUtils.getClosestObject(intersects);

                if ((selectedAnchorMesh != null) && (selectedAnchorMesh.object)) {
                    this._hoveredElementId = selectedAnchorMesh.object.uuid;
                } 
                else {
                    this._hoveredElementId = null;
                }
            }
        }
    }

    private attachControllerEvents(): void {
        this._controller.addEventListener('selectstart', () => {
            this._line.material.linewidth = 3;
          });

        this._controller.addEventListener('selectend', () => {
            this._selectClicked = true;

            this._line.material.linewidth = 1;
        });
    }

    private buildController(): void {
        this._line = new Line(new BufferGeometry().setFromPoints([
            new Vector3(0, 0, 0),
            new Vector3(0, 0, -1)
        ]), new LineBasicMaterial({
            color: 0xffffff,
            linewidth: 1,
            linecap: 'round', //ignored by WebGLRenderer
            linejoin:  'round' //ignored by WebGLRenderer
        }));

        this._line.invisible = true;

        this._line.scale.z = 10;

        this._controller.add(this._line);

        this._scene.add(this._controller);
        
        this._controllerMesh = (new XRControllerModelFactory()).createControllerModel(this._controllerGrip);
        this._controllerMesh.invisible = true;

        this._controllerGrip.add(this._controllerMesh);
        
        this._scene.add(this._controllerGrip);
    }
}