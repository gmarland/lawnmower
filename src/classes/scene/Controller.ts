import { 
    Scene
} from 'three';

import { XRControllerModelFactory } from '../../libs/three/XRControllerModelFactory.js';

import { ControllerPositionType } from "./ControllerPosition";

export class Controller {
    private _scene: Scene;

    private _position: ControllerPositionType;

    private _controller;

    private _controllerSpace;

    private _controllerMesh;

    constructor(scene: Scene, position: ControllerPositionType, controller, controllerSpace) {
        this._scene = scene;
        
        this._position = position;

        this._controller = controller;

        this._controllerSpace = controllerSpace;

        this.buildController();
    }

    private buildController(): void {
        this._controllerMesh = (new XRControllerModelFactory()).createControllerModel(this._controllerSpace);

        this._controllerSpace.add(this._controllerMesh);
        
        this._scene.add(this._controllerSpace);
    }
}