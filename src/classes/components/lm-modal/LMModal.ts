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
import { LMLayout } from '../lm-layout/LMLayout';
import { LMModalConfig } from "./LMModalConfig";
import { GeometryUtils } from '../../geometry/GeometryUtils';

export class LMModal implements SceneElement {
    private _depth: number;

    private _parent: SceneElement;

    private _id: string;

    private _baseImagePath: string;

    private _initialWidth: number; //Defined width from the HTML tag
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
    
    private _drawing: boolean = false;
    private _redraw: boolean = false;

    private  _childElement: SceneElement = null;

    private _modalShown: Function = null;

    private _modalHidden: Function = null;

    constructor(depth: number, parent: SceneElement, id: string, config: LMModalConfig) {
        this._depth = depth;

        this._parent = parent;

        this._id = id;

        this._baseImagePath = config.baseImagePath;

        this._initialWidth = config.width;
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
    
    public get id(): string {
        return this._id;
    }
    
    public get uuid(): string {
        return this._content.uuid;
    }

    public get dynamicWidth(): boolean {
        return (this._initialWidth == null);
    }

    public get width(): number {
        if (this._setWidth !== null) return this._setWidth;
        else return this._initialWidth ? this._initialWidth : 0;
    }

    public get borderRadius(): number {
        return this._borderRadius;
    }

    public get borderColor(): string {
        return this._borderColor;
    }

    public get borderWidth(): number {
        return this._borderWidth;
    }

    public get backgroundColor(): string {
        return this._backgroundColor;
    }

    public get padding(): number {
        return this._padding;
    }

    public get closeButtonWidth(): number {
        return this._closeButtonWidth;
    }

    public get visible(): boolean {
        return this._content.visible;
    }

    ////////// Setters

    public set id(value: string) {
        this._id = value;
    }

    public set width(value: number) {
        this._setWidth = value;
    }

    public set borderRadius(value: number) {
        this._borderRadius = value;
    }

    public set borderColor(value: string) {
        this._borderColor = value;
    }

    public set borderWidth(value: number) {
        this._borderWidth = value;
    }

    public set backgroundColor(value: string) {
        this._backgroundColor = value;
    }

    public set padding(value: number) {
        this._padding = value;
    }

    public set closeButtonWidth(value: number) {
        this._closeButtonWidth = value;
    }

    public set modalShown(value: Function) {
        this._modalShown = value;
    }

    public set modalHidden(value: Function) {
        this._modalHidden = value;
    }

    public set visible(value: boolean) {
        const updated = (this._content.visible !== value)

        this._content.visible = value;

        if (updated) {
            if ((value) && (this._modalShown)) this._modalShown();
            else if (this._modalHidden) this._modalHidden();
        }
    }

    ////////// Public Methods

    // --- Data Methods

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
            width: this._initialWidth,
            height: this._calculatedHeight
        };
    }
    
    public async getPosition(): Promise<Vector3> {
        return new Promise(async (resolve) => {
            if (!this._initialized) await this.draw(); 
    
            resolve(new Vector3(0,0,this._offset));
        });
    }

    public addChildElement(position: number, childElement: SceneElement): Promise<void> {
        return new Promise((resolve) => {
            this._childElement  = childElement;

            resolve();
        });
    }

    public removeChildElement(childElement: SceneElement): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    public getChildSceneElements(): SceneElement[] {
        return [];
    }

    public getIsChildElement(uuid: string): boolean {
        return uuid === this.uuid;
    }
    
    public isPartOfLayout(): boolean {
        if (this._parent) {
            if (this._parent instanceof LMLayout) return true;
            if (this._parent instanceof MainScene) return false;
            else return this._parent.isPartOfLayout();
        }
        else {
            return false;
        }
    }

    public isLayoutChild(layoutId: string): boolean {
        if (this._parent) {
            if ((this._parent instanceof LMLayout) && 
                ((this._parent as LMLayout).id == layoutId)) {
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

    // --- Rendering Methods

    public async draw(): Promise<boolean> {
        this. _initialized = true;
        
        return new Promise(async (resolve) => {
            if (!this._drawing) {
                this._drawing = true;
                this._redraw = false;

                if (this._setWidth !== null) await this.generateContent(this._setWidth);
                else await this.generateContent(this._initialWidth);
                    
                this._drawing = false;
                    
                if (this._redraw) {
                    await this.draw();
                    
                    resolve(false);
                }
                else {
                    resolve(false);
                }
            }
            else {
                this._redraw = true;

                resolve(false);
            }

        });
    }

    public async drawParent(): Promise<void> {
        const updatedDimensions = await this._parent.draw();
        if (updatedDimensions || (this._parent instanceof LMLayout)) await this._parent.drawParent();
    }

    public clicked(meshId: string): Promise<void> {
        return new Promise((resolve) => {
            if (this._closeButtonMesh && (MeshUtils.ObjectContainsUid(meshId, this._closeButtonMesh))) {
                this.visible = false;
            }

            resolve();
        });
    }
    
    public update(delta: number): void {
    }

    public enableLayout(layoutId: string): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    public disableLayouts(): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    public destroy(): Promise<void> {
        return new Promise((resolve) => {
            if (this._parent && this._parent.removeChildElement) this._parent.removeChildElement(this);

            if (this._content) {
                this._content.clear();
                this._content = null;
            }

            this.destroyMesh();

            resolve();
        });
    }

    ////////// Private Methods

    private async generateContent(width: number): Promise<void> {
        return new Promise(async (resolve) => {
            this._content.clear();

            this.destroyMesh();
            
            let dialogWidth = width;
            let dialogHeight = this._height ? this._height : 0;

            if (this._childElement) {
                this._childElement.width = (this._initialWidth-(this._padding*2));
                await this._childElement.draw();

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
        buttonContainerMargin.translateZ(0.5);

        const buttonContainer = new Mesh(PlaneUtils.getPlane(this._closeButtonWidth-2, this._closeButtonWidth-2, this._borderRadius), MaterialUtils.getBasicMaterial({
            color: new Color(this._backgroundColor),
            side: DoubleSide
        }));
        buttonContainer.translateZ(1);

        const button = new Mesh(PlaneUtils.getSquaredPlane(this._closeButtonWidth-(this._closeButtonWidth/2), this._closeButtonWidth-(this._closeButtonWidth/2)), MaterialUtils.getBasicMaterial({
            map: new TextureLoader().load(this._baseImagePath + '/close.png'),
            transparent: true,
            side: DoubleSide
        }));
        button.translateZ(1.5);

        buttonGroup.add(buttonContainerMargin);
        buttonGroup.add(buttonContainer);
        buttonGroup.add(button);

        buttonGroup.translateY(((dialogHeight/2)*-1) - (GeometryUtils.getDimensions(buttonGroup).height/2) - 5);
        buttonGroup.translateZ(0.5);

        return buttonGroup;
    }

    private destroyMesh(): void {
        if (this._mesh) {
            this._mesh.geometry.dispose();
            this._mesh.material.dispose();
            this._mesh = null;
        }

        if (this._closeButtonMesh) {
            for (let i=(this._closeButtonMesh.children.length-1); i>=0; i--) {
                if (this._closeButtonMesh.children[i]) {
                    if (this._closeButtonMesh.children[i].geometry) this._closeButtonMesh.children[i].geometry.dispose();
                    if (this._closeButtonMesh.children[i].material) this._closeButtonMesh.children[i].material.dispose();
                    this._closeButtonMesh.children[i] = null
                }
            }
        }
    }
}