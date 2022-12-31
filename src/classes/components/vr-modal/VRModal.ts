import { 
    Vector3,
    Mesh,
    Object3D,
    Color,
    Box3,
    DoubleSide,
    TextureLoader
} from 'three';

import { Dimensions } from '../../geometry/Dimensions';
import { MaterialUtils } from '../../geometry/MaterialUtils';
import { MeshUtils } from '../../geometry/MeshUtils';
import { PlaneUtils } from '../../geometry/PlaneUtils';
import { MainScene } from '../../scene/MainScene';

import { SceneElementPlacement } from "../../scene/SceneElementPlacement";
import { SceneElement } from "../SceneElement";
import { VRLayout } from '../vr-layout/VRLayout';
import { VRModalConfig } from "./VRModalConfig";

export class VRModal implements SceneElement {
    private _depth: number;

    private _parent: SceneElement;

    private _id: string;

    private _uuid: string;

    private _baseImagePath: string;

    private _width: number; //Defined width from the HTML tag
    private _height: number;

    private _setWidth?: number = null; // Set through the API, typically through a parent div

    private _padding: number;

    private _borderRadius: number;

    private _calculatedHeight: number;

    private _offset: number;

    private _backgroundColor: string;

    private _borderColor: string;
    private _borderWidth: number;

    private _closeButtonWidth: number;
    
    private _mesh?: Mesh = null;
    private _closeButtonMesh?: Mesh = null;

    private _content?: Object3D = new Object3D();
    private _initialized: boolean = false;

    private  _childElement: SceneElement = null;

    constructor(depth: number, parent: SceneElement, config: VRModalConfig) {
        this._depth = depth;

        this._parent = parent;

        this._id = config.id;

        this._uuid = MeshUtils.generateId();
        
        this._baseImagePath = config.baseImagePath;

        this._width = config.width;
        this._height = config.height;

        this._closeButtonWidth = config.closeButtonWidth;

        this._padding = config.padding;

        this._borderRadius = config.borderRadius;
        
        this._borderColor = config.borderColor;
        this._borderWidth = config.borderWidth;
        
        this._offset = config.offset;
        
        this._backgroundColor = config.backgroundColor;

        this._content.visible = false;
        this._content.position.z = this._offset;
    }

    ////////// Getters
    
    public getID(): string {
        return this._id;
    }
    
    public getUUID(): string {
        return this._uuid;
    }

    public getPlacementLocation(): SceneElementPlacement {
        return SceneElementPlacement.Modal;
    }

    public async getContent(): Promise<Object3D> {
        return new Promise(async (resolve) => {
            if (!this._initialized) await this.draw();
            
            resolve(this._content);
        });
    }

    public getDimensions(): Dimensions {
        return {
            width: this._width,
            height: this._calculatedHeight
        };
    }
    
    public async getPosition(): Promise<Vector3> {
        return new Promise(async (resolve) => {
            if (!this._initialized) await this.draw(); 
    
            resolve(new Vector3(0,0,this._offset));
        });
    }

    public getChildSceneElements(): SceneElement[] {
        return [];
    }

    public getIsChildElement(uuid: string): boolean {
        return uuid === this._uuid;
    }

    public getVisible(): boolean {
        return this._content.visible;
    }
    
    public isPartOfLayout(): boolean {
        if (this._parent) {
            if (this._parent instanceof VRLayout) return true;
            if (this._parent instanceof MainScene) return false;
            else return this._parent.isPartOfLayout();
        }
        else {
            return false;
        }
    }

    public isLayoutChild(layoutId: string): boolean {
        if (this._parent) {
            if ((this._parent instanceof VRLayout) && 
                ((this._parent as VRLayout).getId() == layoutId)) {
                    return true;
            }
            else if (this._parent instanceof MainScene) {
                return false
            }
            else {
                return this._parent.isLayoutChild(layoutId);
            }
        }
        else {
            return false;
        }
    }

    ////////// Setters

    public async setWidth(width: number): Promise<void> {
        this._setWidth = width;

        return this.draw();
    }

    public setHidden(): void {
        this._content.visible = false;
    }
    
    public setVisible(): void {
        this._content.visible = true;
    }

    public enableLayout(layoutId: string): void {
    }

    public disableLayouts(): void {
    }

    ////////// Public Methods

    // --- Data Methods

    public addChildElement(position: number, childElement: SceneElement): void {
        this._childElement  = childElement;
    }

    // --- Rendering Methods

    public async draw(): Promise<void> {
        this. _initialized = true;
        
        return new Promise(async (resolve) => {
            if (this._setWidth !== null) await this.generateContent(this._setWidth);
            else await this.generateContent(this._width);

            resolve();
        });
    }

    public clicked(meshId: string): Promise<void> {
        return new Promise((resolve) => {
            if (this._closeButtonMesh && (MeshUtils.ObjectContainsUid(meshId, this._closeButtonMesh))) {
                this._content.visible = false;
            }

            resolve();
        });
    }
    
    public update(delta: number): void {
    }

    ////////// Private Methods

    private async generateContent(width: number): Promise<void> {
        return new Promise(async (resolve) => {
            for (let i=(this._content.children.length-1); i>=0; i--) {
                this._content.remove(this._content.children[i]);
            }

            if (this._mesh) {
                this._mesh.geometry.dispose();
                this._mesh.material.dispose();
                this._mesh = null;
            }
            
            if (this._closeButtonMesh) {
                for (let i=(this._closeButtonMesh.children.length-1); i>=0; i--) {
                    this._closeButtonMesh.children[i].geometry.dispose();
                    this._closeButtonMesh.children[i].material.dispose();
                    this._closeButtonMesh.children[i] = null
                }
            }
            
            let dialogWidth = this._width;
            let dialogHeight = this._height ? this._height : 0;

            if (this._childElement) {
                await this._childElement.setWidth(this._width-(this._padding*2));

                const childContent = await this._childElement.getContent();
                
                const dimensions = new Box3().setFromObject(childContent);

                childContent.translateX(((dimensions.max.x+dimensions.min.x)/2)*-1);
                childContent.translateY(((dimensions.max.y+dimensions.min.y)/2)*-1);

                this._content.add(childContent);
            
                const updatedDimensions = new Box3().setFromObject(this._content);
    
                dialogWidth = (updatedDimensions.max.x-updatedDimensions.min.x)+(this._padding*2);
                dialogHeight = (updatedDimensions.max.y-updatedDimensions.min.y)+(this._padding*2);
            }

            this._mesh = this.buildDialogMesh(dialogWidth, dialogHeight);
            this._closeButtonMesh = this.buildCloseMesh(dialogWidth, dialogHeight);

            this._content.add(this._mesh);
            this._content.add(this._closeButtonMesh);

            resolve();
        });
    }

    private buildDialogMesh(dialogWidth: number, dialogHeight: number): Object3D {
        const dialogGroup = new Object3D();

        const outerMesh = new Mesh(PlaneUtils.getPlane(dialogWidth+(this._borderWidth*2), dialogHeight+(this._borderWidth*2), this._borderRadius), MaterialUtils.getBasicMaterial({
            color: new Color(this._borderColor)
        }));

        const innerMesh = new Mesh(PlaneUtils.getPlane(dialogWidth, dialogHeight, this._borderRadius), MaterialUtils.getBasicMaterial({
            color: new Color(this._backgroundColor)
        }));

        innerMesh.castShadow = true;
        innerMesh.recieveShadow = true;
        
        dialogGroup.add(outerMesh);
        dialogGroup.add(innerMesh);

        return dialogGroup;
    }

    private buildCloseMesh(dialogWidth: number, dialogHeight: number): Mesh {
        const buttonGroup = new Object3D();

        const buttonContainerMargin = new Mesh(PlaneUtils.getPlane(this._closeButtonWidth, this._closeButtonWidth, this._borderRadius), MaterialUtils.getBasicMaterial({
            color: new Color(this._borderColor),
            side: DoubleSide
        }));

        const buttonContainer = new Mesh(PlaneUtils.getPlane(this._closeButtonWidth-2, this._closeButtonWidth-2, this._borderRadius), MaterialUtils.getBasicMaterial({
            color: new Color(this._backgroundColor),
            side: DoubleSide
        }));

        const button = new Mesh(PlaneUtils.getSquaredPlane(this._closeButtonWidth-(this._closeButtonWidth/2), this._closeButtonWidth-(this._closeButtonWidth/2)), MaterialUtils.getBasicMaterial({
            map: new TextureLoader().load(this._baseImagePath + '/close.png'),
            transparent: true,
            side: DoubleSide
        }));

        buttonGroup.add(buttonContainerMargin);
        buttonGroup.add(buttonContainer);
        buttonGroup.add(button);

        buttonGroup.position.y = ((dialogHeight/2)-(this._padding/2))*-1;
        buttonGroup.translateZ((this._depth+2)*1);

        return buttonGroup;
    }
}