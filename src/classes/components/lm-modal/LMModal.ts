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

import { SceneElementPlacement } from "../../scene/SceneElementPlacement";
import { ISceneElement } from "../ISceneElement";
import { LMModalConfig } from "./LMModalConfig";
import { GeometryUtils } from '../../geometry/GeometryUtils';
import { BaseSceneElement } from '../BaseSceneElement';
import { LMLayout } from '../lm-layout/LMLayout';
import { MainScene } from '../../scene/MainScene';

export class LMModal extends BaseSceneElement implements ISceneElement {
    private _baseImagePath: string;

    private _initialWidth: number; //Defined width from the HTML tag
    private _height: number;

    private _setWidth?: number = null; // Set through the API, typically through a parent div

    private _padding: number;

    private _borderRadius: number;

    private _calculatedHeight: number;

    private _backgroundColor: string;

    private _borderColor: string;
    private _borderWidth: number;

    private _closeButtonWidth: number;
    
    private _mesh?: Mesh = null;
    private _closeButtonMesh?: Mesh = null;
    
    private _drawing: boolean = false;
    private _redraw: boolean = false;

    private  _childElement: ISceneElement = null;

    private _modalShown: Function = null;

    private _modalHidden: Function = null;

    constructor(parent: ISceneElement, position: Vector3, id: string, config: LMModalConfig) {
        let offset = null;
        if (config.offset) offset = config.offset;
        
        super(parent, position, id, offset);

        this._baseImagePath = config.baseImagePath;

        this._initialWidth = config.width;
        this._height = config.height;

        this._closeButtonWidth = config.closeButtonWidth;

        this._padding = config.padding;

        this._borderRadius = config.borderRadius;
        
        this._borderColor = config.borderColor;
        this._borderWidth = config.borderWidth;
        
        this._backgroundColor = config.backgroundColor;

        this.content.visible = false;
    }

    ////////// Getters

    public get placementLocation(): SceneElementPlacement {
        return SceneElementPlacement.Modal;
    }

    public get dimensions(): Dimensions {
        return {
            width: this._initialWidth,
            height: this._calculatedHeight
        };
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

    ////////// Setters

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
        const updated = (this.content.visible !== value)

        this.content.visible = value;

        if (updated) {
            if ((value) && (this._modalShown)) this._modalShown();
            else if (this._modalHidden) this._modalHidden();
        }
    }

    ////////// Public Methods

    // --- Layout Managment

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

    public isPartOfLayout(): boolean {
        if (this.parent) {
            if (this.parent instanceof LMLayout) return true;
            if (this.parent instanceof MainScene) return false;
            else return this.parent.isPartOfLayout();
        }
        else {
            return false;
        }
    }

    public isLayoutChild(layoutId: string): boolean {
        if (this.parent) {
            if ((this.parent instanceof LMLayout) && 
                ((this.parent as LMLayout).id == layoutId)) {
                    return true;
            }
            else if (this.parent instanceof MainScene) {
                return false
            }
            else {
                return this.parent.isLayoutChild(layoutId);
            }
        }
        else {
            return false;
        }
    }

    // --- Child Management

    public addChildElement(position: number, childElement: ISceneElement): Promise<void> {
        return new Promise((resolve) => {
            this._childElement  = childElement;

            resolve();
        });
    }

    public removeChildElement(childElement: ISceneElement): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    public getChildSceneElements(): ISceneElement[] {
        return [];
    }

    // --- Rendering Methods
    
    public async getPosition(): Promise<Vector3> {
        return new Promise(async (resolve) => {
            if (!this.initialized) await this.draw(); 
    
            resolve(new Vector3(0,0,this.offset));
        });
    }

    public async getContent(): Promise<Object3D> {
        return new Promise(async (resolve) => {
            if (!this.initialized) await this.draw();
            
            resolve(this.content);
        });
    }

    public async drawParent(): Promise<void> {
        const updatedDimensions = await this.parent.draw();
        if (updatedDimensions || (this.parent instanceof LMLayout)) await this.parent.drawParent();
    }

    public async draw(): Promise<boolean> {
        this. initialized = true;
        
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

    public destroy(): Promise<void> {
        return new Promise((resolve) => {
            if (this.parent && this.parent.removeChildElement) this.parent.removeChildElement(this);

            if (this.content) {
                this.content.clear();
                this.content = null;
            }

            this.destroyMesh();

            resolve();
        });
    }

    ////////// Private Methods

    private async generateContent(width: number): Promise<void> {
        return new Promise(async (resolve) => {
            this.content.clear();

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

                this.content.add(childContent);
            
                const updatedDimensions = new Box3().setFromObject(this.content);
    
                dialogWidth = (updatedDimensions.max.x-updatedDimensions.min.x)+(this._padding*2);
                dialogHeight = (updatedDimensions.max.y-updatedDimensions.min.y)+(this._padding*2);
            }

            this._mesh = this.buildDialogMesh(dialogWidth, dialogHeight);
            this._closeButtonMesh = this.buildCloseMesh(dialogWidth, dialogHeight);

            this.content.add(this._mesh);
            this.content.add(this._closeButtonMesh);

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
        innerMesh.receiveShadow = true;
        
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