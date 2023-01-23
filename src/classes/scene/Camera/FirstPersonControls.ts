import { 
    Scene,
    Object3D,
    PerspectiveCamera
} from 'three';

import { GeometryUtils } from '../../geometry/GeometryUtils';

import { ControlsAction } from './ControlsAction';
import { SceneCamera } from './SceneCamera';

export class FirstPersonControls {
    private _scene: Scene;

    private _enabled: boolean;

    private _camera: SceneCamera;

    private _pitchObject: Object3D;
    private _yawObject: Object3D;

    private _movementSpeed: number = 10;

    private _moveForward: boolean = false;
    private _moveLeft: boolean = false;
    private _moveBackward: boolean = false;
    private _moveRight: boolean = false;
    private _moveUp: boolean = false;
    private _moveDown: boolean = false;
    private _rotateLeft: boolean = false;
    private _rotateRight: boolean = false;
    private _rotateDown: boolean = false;
    private _rotateUp: boolean = false;

    private _moveCamera: boolean = false;
    
    private _touchStartPosition?: Touch = null;

    constructor (scene: Scene, camera: SceneCamera, container: HTMLElement, movementSpeed?: number) {
        this._scene = scene;

        this._enabled = true;
    
        if(movementSpeed) this._movementSpeed = movementSpeed;
    
        this._camera = camera;
    
        this._pitchObject = new Object3D();
        this._pitchObject.add(this._camera.camera);
    
        this._yawObject = new Object3D();
        this._yawObject.add(this._pitchObject);

        this._scene.add(this._yawObject);

        this.bindElementEvents(container)
    }
    
    public getCamera(): PerspectiveCamera {
        return this._camera.camera;
    } 

    public isEnabled(): boolean {
        return this._enabled;
    }

    public onMouseDown(event: MouseEvent): void {
        if ((this._enabled) && (this.getIsRightMouseButton(event))) this._moveCamera = true;
    }
    
    public onMouseUp(event: MouseEvent): void {
        if ((this._enabled) && (this.getIsRightMouseButton(event))) this._moveCamera = false;
    }

    public onMouseMove(event: MouseEvent): void {
        if (this._moveCamera) {
            var movementX = event.movementX || 0,
                movementY = event.movementY || 0;

            this._yawObject.rotation.y = GeometryUtils.normalizePosition(this._yawObject.rotation.y - movementX * 0.004);
            this._pitchObject.rotation.x = GeometryUtils.normalizePosition(this._pitchObject.rotation.x - movementY * 0.004);
        }
    }

    public getMovementSpeed(): number {
        return this._movementSpeed;
    }

    public getIsMiddleMouseButton(event: MouseEvent): boolean {
        var button = event.which || event.button;

        return button == 2;
    }

    public getIsLeftMouseButton(event: MouseEvent): boolean {
        var button = event.which || event.button;

        return button == 1;
    }

    public getIsRightMouseButton(event: MouseEvent): boolean {
        var button = event.which || event.button;

        return button == 3;
    }

    public onTouchStart(e: TouchEvent): void {
        if (e.touches.length == 1) {
            this._touchStartPosition = e.touches[0];
        }
    }
    
    public onTouchEnd(): void {
        this._touchStartPosition = null;
    }	
    
    public onTouchMove(e: TouchEvent): void {
        var distX = this._touchStartPosition.pageX - e.touches[0].pageX,
            distY = this._touchStartPosition.pageY - e.touches[0].pageY;

        this._yawObject.rotation.y = GeometryUtils.normalizePosition(this._yawObject.rotation.y - distX * 0.004);
        this._pitchObject.rotation.x = GeometryUtils.normalizePosition(this._pitchObject.rotation.x - distY * 0.004);
        
        this._touchStartPosition = e.touches[0];
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (this._enabled) {
            switch ( event.keyCode ) {

                case 87: /*W*/ this._moveForward = true; break;

                case 65: /*A*/ this._moveLeft = true; break;

                case 83: /*S*/ this._moveBackward = true; break;

                case 68: /*D*/ this._moveRight = true; break;

                case 82: /*R*/ this._moveUp = true; break;
                case 70: /*F*/ this._moveDown = true; break;

                case 81: /*Q*/ this._rotateLeft = true; break;
                case 69: /*E*/ this._rotateRight = true; break;

                case 90: /*C*/ this._rotateDown = true; break;
                case 88: /*X*/ this._rotateUp = true; break;
            }
        }
    }

    public onKeyUp(event: KeyboardEvent): void {
        if (this._enabled) {
            switch ( event.keyCode ) {
                case 87: /*W*/ this._moveForward = false; break;

                case 65: /*A*/ this._moveLeft = false; break;

                case 83: /*S*/ this._moveBackward = false; break;

                case 68: /*D*/ this._moveRight = false; break;

                case 82: /*R*/ this._moveUp = false; break;
                case 70: /*F*/ this._moveDown = false; break;

                case 81: /*Q*/ this._rotateLeft = false; break;
                case 69: /*E*/ this._rotateRight = false; break;

                case 90: /*C*/ this._rotateDown = false; break;
                case 88: /*X*/ this._rotateUp = false; break;
            }
        }
    }

    public setCameraPosition(x, y, z) {
        this._yawObject.position.x = x;
        this._yawObject.position.y = y;
        this._yawObject.position.z = z;
    }

    public rotateCamera(x, y) {
        this._yawObject.rotation.y = GeometryUtils.normalizePosition(this._yawObject.rotation.y + x);
        this._pitchObject.rotation.x = GeometryUtils.normalizePosition(this._pitchObject.rotation.x + y);
    }

    public getCameraPosition() {
        return {
            position: {
                x: this._yawObject.position.x,
                y: this._yawObject.position.y,
                z:this._yawObject.position.z
            },
            rotation: {
                x: this._yawObject.rotation.y,
                y: this._pitchObject.rotation.x
            }
        }
    }

    public update(): ControlsAction {
        let postionUpdated = {
            postionMoved: false,
            rotationMoved: false
        }

        // Actions to move the camera via keyboard commands
        if (this._moveForward) {
            this._yawObject.translateZ(-this._movementSpeed);
            postionUpdated.postionMoved = true;
        }
        
        if (this._moveBackward) {
            this._yawObject.translateZ(this._movementSpeed);
            postionUpdated.postionMoved = true;
        }

        if (this._moveLeft) {
            this._yawObject.translateX(-this._movementSpeed);
            postionUpdated.postionMoved = true;
        }

        if (this._moveRight) {
            this._yawObject.translateX(this._movementSpeed);
            postionUpdated.postionMoved = true;
        }

        if (this._moveUp) {
            this._yawObject.translateY(this._movementSpeed);
            postionUpdated.postionMoved = true;
        }
        
        if (this._moveDown) {
            this._yawObject.translateY(-this._movementSpeed);
            postionUpdated.postionMoved = true;
        }

        if (this._rotateLeft) {
            this._yawObject.rotation.y = GeometryUtils.normalizePosition(this._yawObject.rotation.y + 0.04);
            postionUpdated.rotationMoved = true;
        }

        if (this._rotateRight) {
            this._yawObject.rotation.y = GeometryUtils.normalizePosition(this._yawObject.rotation.y - 0.04);
            postionUpdated.rotationMoved = true;
        }

        if (this._rotateUp) {
            this._pitchObject.rotation.x = GeometryUtils.normalizePosition(this._pitchObject.rotation.x - 0.04);
            postionUpdated.rotationMoved = true;
        }

        if (this._rotateDown) {
            this._pitchObject.rotation.x = GeometryUtils.normalizePosition(this._pitchObject.rotation.x + 0.04);
            postionUpdated.rotationMoved = true;
        }

        return postionUpdated;
    }

    private bindElementEvents(container: HTMLElement) {
        const that = this;

        container.addEventListener('mousemove', (e: MouseEvent) => {
          that.onMouseMove(e);
        }, false);
    
        container.addEventListener('mouseup', (e: MouseEvent) => {
          that.onMouseUp(e);
        }, false);
    
        container.addEventListener('mousedown', (e: MouseEvent) => {
          that.onMouseDown(e);
        }, false);
    
        container.addEventListener( "touchmove", (e: TouchEvent) => {
          that.onTouchMove(e);
        }, false );
    
        container.addEventListener("touchstart", (e: TouchEvent) => {
          that.onTouchStart(e);
        }, false );
    
        container.addEventListener("touchend", (e: TouchEvent) => {
          that.onTouchEnd();
        }, false );
    
        document.addEventListener("keyup", (e: KeyboardEvent) => {
          that.onKeyUp(e);
        }, false );
    
        document.addEventListener("keydown", (e: KeyboardEvent) => {
            that.onKeyDown(e);
        }, false );
    }
}