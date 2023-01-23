import { 
    Clock,
    Scene,
    Raycaster,
    Vector2,
    Object3D,
    Box3,
    WebGLRenderer,
    WebGLRenderTarget,
    Mesh,
    PlaneBufferGeometry,
    MeshBasicMaterial,
    LinearFilter,
    NearestFilter,
    RepeatWrapping
} from 'three';

import { SceneCamera } from './Camera/SceneCamera';
import { Renderer } from '../scene/Renderer';
import { Lighting } from './Lighting';
import { GeometryUtils } from '../geometry/GeometryUtils';
import { SceneElementPlacement } from './SceneElementPlacement';
import { Controller } from './Camera/Controller';
import { ControllerPositionType } from './Camera/ControllerPosition';

import { ISceneElement } from '../components/ISceneElement';
import { LMModal } from '../components/lm-modal/LMModal';
import { LMLayout } from '../components/lm-layout/LMLayout';
import { RenderCamera } from './RenderCamera';
import { FirstPersonControls } from './Camera/FirstPersonControls';

export class MainScene {
    public _defaultSceneRadius: number = 500;

    private _vrEnabled: boolean;

    private _shadowsEnabled: boolean;

    private _skyboxColor: number = 0xefefef;
    private _skyboxOpacity: number = 1;

    private _parentElement: HTMLDivElement;

    private _scene = new Scene();

    private _renderScene = new Scene();
    private _renderCamera: RenderCamera;
    private _sceneRenderTarget: WebGLRenderTarget;
    private _renderPlane: Mesh;

    private _id: string;

    private _raycaster: Raycaster;
    private _mouse: Vector2;

    private _clock: Clock;

    private _lighting: Lighting;

    private _sceneCamera: SceneCamera;
    private _renderer: Renderer;

    private _controllers: Controller[] = new Array<Controller>();
    private _controls: FirstPersonControls;

    private _selectedLayout?: string = null;

    private _childElements: ISceneElement[] = new Array<ISceneElement>();
    private _modalElements: LMModal[] = new Array<LMModal>();

    private _isInitialized: boolean = false;
    
    private _mainObjectContainer: Object3D = new Object3D();
    private _modalContainer: Object3D = new Object3D();
    
    private _drawing: boolean = false;
    private _redraw: boolean = false;

    // ===== exposedEvents

    public sceneObjectSelected: Function = null;

    public showMovementVectorMenu: Function = null;

    constructor(mouse: Vector2) {
        this._raycaster = new Raycaster();

        this._mouse = mouse;
    }
    
    public get id(): string {
        return this._id;
    }

    public get renderer(): Renderer {
        return this._renderer;
    }

    public get webGLRenderer(): WebGLRenderer {
        return this._renderer.webGLRenderer;
    }

    public set id(value: string) {
        this._id = value;
    }

    public init(vrEnabled: boolean, shadowsEnabled: boolean, controllerGuides: boolean, parentElement: HTMLDivElement, startingDistance: number): void {
        this._vrEnabled = vrEnabled;

        this._shadowsEnabled = shadowsEnabled;

        this._parentElement = parentElement;
        if (startingDistance) this._defaultSceneRadius = startingDistance;
        
        this._clock = new Clock();

        this._sceneCamera = new SceneCamera(this._vrEnabled, this._parentElement, this._scene, this._shadowsEnabled, this._defaultSceneRadius);
        this._sceneCamera.setPosition(0, 0, 0);

        this._lighting = new Lighting(this._scene, this._sceneCamera, this._shadowsEnabled);

        this._renderer = new Renderer(this._vrEnabled, this._sceneCamera, this._parentElement, this._shadowsEnabled, this._skyboxColor, this._skyboxOpacity);

        this.initializeControls(controllerGuides);

        this._scene.add(this._mainObjectContainer);
        this._scene.add(this._modalContainer);

        this._renderCamera = new RenderCamera();

        this._sceneRenderTarget = new WebGLRenderTarget(this._parentElement.clientWidth, this._parentElement.clientHeight, {
            minFilter: LinearFilter,
            magFilter:  NearestFilter,
            wrapS: RepeatWrapping
        });
        
        this._renderPlane = new Mesh(new PlaneBufferGeometry(2, 2, 1, 1),
                                    new MeshBasicMaterial({
                                        map: this._sceneRenderTarget.texture
                                    }));

        this._renderScene.add(this._renderPlane);

        this._renderCamera = new RenderCamera();

        this.startRender();

        this._isInitialized = true;
           
        for (let i=0; i<this._childElements.length; i++) {
            this.attachToScene(this._childElements[i])
        }
    }

    public showModalDialogByID(id: string) {
        let selectModalElement = null;

        for (let i=0; i<this._modalElements.length; i++) {
            this._modalElements[i].visible = false;

            if (this._modalElements[i].id == id) selectModalElement = this._modalElements[i];
        }
        
        if (selectModalElement &&
            (!selectModalElement.isPartOfLayout() ||
            selectModalElement.isLayoutChild(this.getCurrentLayout()))) selectModalElement.visible = true;
    }

    public showModalDialogByUUID(uuid: string) {
        let selectModalElement = null;

        for (let i=0; i<this._modalElements.length; i++) {
            this._modalElements[i].visible = false;

            if (this._modalElements[i].uuid == uuid) selectModalElement = this._modalElements[i];
        }

        if (selectModalElement &&
            (!selectModalElement.isPartOfLayout() ||
            selectModalElement.isLayoutChild(this.getCurrentLayout()))) selectModalElement.visible = true;
    }

    public hideModalDialog() {
        for (let i=0; i<this._modalElements.length; i++) {
            this._modalElements[i].visible = false;
        }
    }

    public onClick() {
        this._raycaster.setFromCamera(this._mouse, this._sceneCamera.camera);

        const intersects = this._raycaster.intersectObjects(this._scene.children);
        
        if (intersects && intersects.length > 0) {
            const selectedAnchorMesh = GeometryUtils.getClosestObject(intersects);
            
            if (selectedAnchorMesh != null) {
                for (let i=0; i<this._childElements.length; i++) {
                    this._childElements[i].clicked(selectedAnchorMesh.object.uuid)
                }
            }
        }
    }

    public async addChildElement(position: number, childElement: ISceneElement): Promise<void> {
        return new Promise(async (resolve) => {
            this._childElements.push(childElement);

            if (this._isInitialized) await this.attachToScene(childElement);

            resolve();
        });
    }

    public async updateRootElementPosition(childElement: ISceneElement): Promise<void> {
        return new Promise(async (resolve) => {
            await this._sceneCamera.updateCameraElementPosition(childElement);

            resolve();
        });
    }

    public async attachToScene(childElement: ISceneElement): Promise<void> {
        return new Promise(async (resolve) => {
            let currentLayout = this.getCurrentLayout();

            if (!(childElement instanceof LMLayout)) {
                if (childElement.isPartOfLayout()) {
                    if (childElement.visible && childElement.isLayoutChild(currentLayout)) childElement.visible = true;
                    else childElement.visible = false;;
                }
            }
            
            if (childElement.placementLocation == SceneElementPlacement.Main) {
                await childElement.enableLayout(currentLayout);

                const content = await childElement.getContent();
                
                if (childElement.position == null) {
                    content.translateZ(this._defaultSceneRadius*-1);
                }
                else {
                    content.position.set(childElement.position.x, childElement.position.y, childElement.position.z*-1);
                }

                this._mainObjectContainer.add(content);  
            }
            else if (childElement.placementLocation == SceneElementPlacement.Modal) {
                this._modalElements.push(childElement as LMModal);

                const modalDialog = await childElement.getContent();
                modalDialog.position.z = (this._defaultSceneRadius*-1) + (await childElement.getPosition()).z;

                this._modalContainer.add(modalDialog);
            }
            else if (childElement.placementLocation == SceneElementPlacement.AttachedToCamera) {
                await this._sceneCamera.addElementToCamera(childElement);
            }
            else if (childElement.placementLocation == SceneElementPlacement.PlacedAtCamera) {
                await this._sceneCamera.addElementAtCamera(childElement);
            }

            resolve();
        });
    }

    public hideCurrentLayout(): void {
        this._mainObjectContainer.visible = false;
    }

    public showCurrentLayout(): void {
        this._mainObjectContainer.visible = true;
    }

    public getChildSceneElements(): ISceneElement[] {
        return this._childElements;
    }

    public getLayout(): Object3D {
        return this._mainObjectContainer;
    }

    public resize(): void {
        this._sceneCamera.resize();
        this._renderer.resize();
    }
    
    private getCurrentLayout() {
        let currentLayout = this._selectedLayout;
        if(!currentLayout) currentLayout = "index";

        return currentLayout;
    }
    
    public setLayout(layoutId: string): Promise<void> {
        return new Promise(async (resolve) => {
            this._selectedLayout = layoutId;

            let currentLayout = this.getCurrentLayout();
    
            this._mainObjectContainer.visible = false;
    
            for (let i=0; i<this._childElements.length; i++) {
                await this._childElements[i].enableLayout(currentLayout);
            }
    
            this._mainObjectContainer.visible = true;
            
            resolve();
        });
    }
    
    public async draw(): Promise<void> {
        return new Promise(async (resolve) => {
            if (!this._drawing) {
                this._drawing = true;
                this._redraw = false;

                const mainObjectBox = new Box3().setFromObject(this._mainObjectContainer);

                this._mainObjectContainer.translateX(((mainObjectBox.max.x+mainObjectBox.min.x)/2)*-1);
                this._mainObjectContainer.translateY(((mainObjectBox.max.y+mainObjectBox.min.y)/2)*-1);
                this._mainObjectContainer.translateZ(((mainObjectBox.max.z+mainObjectBox.min.z)/2)*-1);

                this._drawing = false;
                
                if (this._redraw) {
                    await this.draw();
                    
                    resolve();
                }
                else {
                    resolve();
                }
            }
            else {
                this._redraw = true;

                resolve();
            }
        })
    }

    private initializeControls(controllerGuides: boolean) {
        if (this._vrEnabled) {
            const leftController = this._renderer.getController(0);
            if (leftController) this._controllers.push(new Controller(this._scene, ControllerPositionType.Left, controllerGuides, leftController, this._renderer.getControllerGrip(0)));

            const rightController = this._renderer.getController(1);
            if (rightController) this._controllers.push(new Controller(this._scene, ControllerPositionType.Right, controllerGuides, rightController, this._renderer.getControllerGrip(1)));
        }
        else {
            this._controls = new FirstPersonControls(this._scene, this._sceneCamera, this._parentElement);
        }
    }

    private startRender(): void {
        if (this._vrEnabled) {
            this._renderer.setAnimationLoop(() => {
                this.update();
        
                this._renderer.render(this._scene, this._sceneCamera);
            } );
        }
        else {
            this.renderScene();
        }
    }

    private renderScene(): void {
        this.update();

        this._renderer.setRenderedTarget(this._sceneRenderTarget);
        this._renderer.render(this._scene, this._sceneCamera);
        this._renderer.setRenderedTarget(null);
        this._renderer.render(this._renderScene, this._renderCamera);

        requestAnimationFrame(() => this.renderScene());
    }

    private update(): void {
        const delta = this._clock.getDelta();

        if (this._isInitialized) {
            for (let i=0; i<this._childElements.length; i++) {
                this._childElements[i].update(delta);
            }
        }

        if (this._vrEnabled) {
            for (let i=0; i<this._controllers.length; i++) {
                this.updateController(this._controllers[i]);
            }
        }
        else {
            this._controls.update();
        }

        if (this._sceneCamera) this._sceneCamera.Update();
    }

    private updateController(controller: Controller) {
        controller.update();
        
        if (controller.selectClicked) {
            controller.selectClicked = false;

            for (let i=0; i<this._childElements.length; i++) {
                this._childElements[i].clicked(controller.hoveredElementId)
            }
        }
    }
}