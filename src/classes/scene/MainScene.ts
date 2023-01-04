import { 
    Clock,
    Scene,
    Raycaster,
    Vector2,
    Object3D,
    Box3
} from 'three';

import { Camera } from '../scene/Camera';
import { Renderer } from '../scene/Renderer';
import { SceneElement } from '../components/SceneElement';
import { Lighting } from './Lighting';
import { GeometryUtils } from '../geometry/GeometryUtils';
import { SceneElementPlacement } from './SceneElementPlacement';
import { VRModal } from '../components/vr-modal/VRModal';
import { VRLayout } from '../components/vr-layout/VRLayout';

export class MainScene {
    public static BasePlaneWidth: number = 1000;

    public static readonly VoxelSize: number = 10;

    public gridPositionChanged?: Function = null;

    private _skyboxColor: number = 0xefefef;
    private _skyboxOpacity: number = 1;

    private _parentElement: HTMLDivElement;

    private _scene = new Scene();

    private _raycaster: Raycaster;
    private _mouse: Vector2;

    private _clock: Clock;

    private _camera: Camera;
    private _renderer: Renderer;

    private _selectedLayout?: string = null;

    private _childElements: SceneElement[] = new Array<SceneElement>();
    private _modalElements: VRModal[] = new Array<VRModal>();

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

    public init(parentElement: HTMLDivElement, startingDistance: number, basePlaneWidth?: number): void {
        this._parentElement = parentElement;
        if (basePlaneWidth) MainScene.BasePlaneWidth = basePlaneWidth;
        
        this._clock = new Clock();

        new Lighting(this._scene, MainScene.BasePlaneWidth, MainScene.VoxelSize);

        this._camera = new Camera(this._parentElement, this._scene, MainScene.BasePlaneWidth);
        this._camera.setPosition(0, 0, startingDistance);
        this._camera.setLookAt(0, 0, 0);

        this._renderer = new Renderer(this._parentElement, this._skyboxColor, this._skyboxOpacity);
        
        this._scene.add(this._mainObjectContainer);
        this._scene.add(this._modalContainer);

        this.startRender();

        this._isInitialized = true;
           
        for (let i=0; i<this._childElements.length; i++) {
            this.attachToScene(this._childElements[i])
        }
    }

    public showModalDialogByID(id: string) {
        let selectModalElement = null;

        for (let i=0; i<this._modalElements.length; i++) {
            this._modalElements[i].setHidden();

            if (this._modalElements[i].getID() == id) selectModalElement = this._modalElements[i];
        }
        
        if (selectModalElement &&
            (!selectModalElement.isPartOfLayout() ||
            selectModalElement.isLayoutChild(this.getCurrentLayout()))) selectModalElement.setVisible();
    }

    public showModalDialogByUUID(uuid: string) {
        let selectModalElement = null;

        for (let i=0; i<this._modalElements.length; i++) {
            this._modalElements[i].setHidden();

            if (this._modalElements[i].getUUID() == uuid) selectModalElement = this._modalElements[i];
        }

        if (selectModalElement &&
            (!selectModalElement.isPartOfLayout() ||
            selectModalElement.isLayoutChild(this.getCurrentLayout()))) selectModalElement.setVisible();
    }

    public hideModalDialog() {
        for (let i=0; i<this._modalElements.length; i++) {
            this._modalElements[i].setHidden();
        }
    }

    public onClick() {
        this._raycaster.setFromCamera(this._mouse, this._camera.getCamera());

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

    public async addChildElement(position: number, childElement: SceneElement): Promise<void> {
        return new Promise(async (resolve) => {
            this._childElements.push(childElement);
            
            if (this._isInitialized) await this.attachToScene(childElement);

            resolve();
        });
    }

    public async attachToScene(childElement: SceneElement): Promise<void> {
        return new Promise(async (resolve) => {
            let currentLayout = this.getCurrentLayout();

            if (!(childElement instanceof VRLayout)) {
                if (childElement.isPartOfLayout()) {
                    if (childElement.getVisible() && childElement.isLayoutChild(currentLayout)) childElement.setVisible();
                    else childElement.setHidden();
                }
            }
            
            if (childElement.getPlacementLocation() == SceneElementPlacement.Main) {
                await childElement.enableLayout(currentLayout);
    
                this._mainObjectContainer.add(await childElement.getContent());

                const mainBox = new Box3().setFromObject(this._mainObjectContainer);
                
                this._mainObjectContainer.position.x = mainBox.max.x-(mainBox.max.x-mainBox.min.x)/2;
                this._mainObjectContainer.position.y = (mainBox.max.y-mainBox.min.y)/2;    
            }
            else if (childElement.getPlacementLocation() == SceneElementPlacement.Modal) {
                this._modalElements.push(childElement as VRModal);

                const modalDialog = await childElement.getContent();
                modalDialog.position.z = (await childElement.getPosition()).z;

                this._modalContainer.add(modalDialog);
            }
            if (childElement.getPlacementLocation() == SceneElementPlacement.AttachedToCamera) {
                await this._camera.addElementToCamera(childElement);
            }
            if (childElement.getPlacementLocation() == SceneElementPlacement.PlacedAtCamera) {
                await this._camera.addElementAtCamera(childElement);
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

    public getChildSceneElements(): SceneElement[] {
        return this._childElements;
    }

    public getLayout(): Object3D {
        return this._mainObjectContainer;
    }

    public resize(): void {
        this._camera.resize();
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

    private startRender(): void {
        this.renderScene();
    }

    private renderScene(): void {
        this.update();

        this._renderer.render(this._scene, this._camera);

        requestAnimationFrame(() => this.renderScene());
    }

    private update(): void {
        const delta = this._clock.getDelta();

        if (this._isInitialized) {
            for (let i=0; i<this._childElements.length; i++) {
                this._childElements[i].update(delta);
            }
        }
    }
}