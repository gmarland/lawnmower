import { 
    Color,
    Mesh,
    Object3D,
    Vector3,
    Box3,
    DoubleSide,
    Group
} from 'three';

import { HorizontalAlign } from '../../geometry/HorizontalAlign';
import { ItemHorizontalAlign } from '../../geometry/ItemHorizontalAlign';
import { ItemVerticalAlign } from '../../geometry/ItemVerticalAlign';

import { SceneElement } from "../SceneElement";
import { VerticalAlign } from '../../geometry/VerticalAlign';
import { VRDivConfig } from './VRDivConfig';
import { Dimensions } from '../../geometry/Dimensions';
import { PlaneUtils } from '../../geometry/PlaneUtils';
import { SceneElementPlacement } from '../../scene/SceneElementPlacement';
import { MaterialUtils } from '../../geometry/MaterialUtils';
import { MeshUtils } from '../../geometry/MeshUtils';
import { VRLayout } from '../vr-layout/VRLayout';
import { MainScene } from '../../scene/MainScene';

export class VRDiv implements SceneElement {
    private _depth: number;

    private _parent: SceneElement;

    private _uuid: string;

    private _width: number; 
    private _height?: number;
    private _borderRadius: number;

    private _color: string = "";
    
    private _margin: number = 0;
    private _padding: number = 0;

    private _opacity: number = 1;

    private _verticalAlign: VerticalAlign;
    private _horizontalAlign: HorizontalAlign;

    private _itemVerticalAlign: ItemVerticalAlign;
    private _itemHorizontalAlign: ItemHorizontalAlign;

    private _xRotation: number; 
    private _yRotation: number; 
    private _zRotation: number;

    private _content: Group = new Group();

    private _childElements: Map<number, SceneElement> = new Map<number, SceneElement>();

    public onClick?: Function = null;

    constructor(depth: number, parent: SceneElement, config: VRDivConfig) {
        this._depth = depth;
        
        this._parent = parent;

        this._uuid = MeshUtils.generateId();

        this._verticalAlign = config.verticalAlign;
        this._horizontalAlign = config.horizontalAlign;
        
        this._itemVerticalAlign = config.itemVerticalAlign;
        this._itemHorizontalAlign = config.itemHorizontalAlign;

        this._width = config.width;
        this._height = config.height;

        this._borderRadius = config.borderRadius;
        
        this._color = config.color;

        if (config.opacity) this._opacity = config.opacity;

        if (config.padding) this._padding = config.padding;
        if (config.margin) this._margin = config.margin;

        this._xRotation = config.xRotation;
        this._yRotation = config.yRotation;
        this._zRotation = config.zRotation;
        
        this._content.translateZ(this._depth*0.5);
    }

    ////////// Getters
    
    public getUUID(): string {
        return this._uuid;
    }
    
    public getPlacementLocation(): SceneElementPlacement {
        return SceneElementPlacement.Main;
    }

    public getChildElements(): Map<number, SceneElement> {
        return this._childElements;
    }

    public getColor(): string {
        return this._color;
    }

    public getPadding(): number {
        return this._padding;
    }

    public getMargin(): number {
        return this._margin;
    }

    public getItemHorizontalAlign(): ItemHorizontalAlign {
        return this._itemHorizontalAlign;
    }

    public getItemVerticalAlign(): ItemVerticalAlign {
        return this._itemVerticalAlign;
    }

    public getDimensions(): Dimensions {
        return {
            width: this._width,
            height: this._height
        }
    }

    public getCalculatedDimensions(): Dimensions {
        const dimensions = new Box3().setFromObject(this._content);

        return {
            width: dimensions.max.x-dimensions.min.x,
            height: dimensions.max.y-dimensions.min.y
        }
    }
    
    public getChildSceneElements(): SceneElement[] {
        let keys = Array.from(this._childElements.keys());
        keys.sort(function(a, b){return a-b});

        const elements = [];
        
        for (let i=0; i< keys.length; i++) {
            elements.push(this._childElements.get(keys[i])); 
        }

        return elements;
    }

    public getContentObject(): Object3D {
        return this._content;
    }

    public getXRotation(): number {
        return this._xRotation;
    }
    
    public getYRotation(): number {
        return this._yRotation;
    }
    
    public getZRotation(): number {
        return this._zRotation;
    }

    public getContent(): Object3D {
        return null;
    }
    
    public getPosition(): Vector3 {
        return this._content.position;
    }

    public getVisible(): boolean {
        return this._content.visible;
    }

    public getDepth(): number {
        return this._depth;
    }

    public getIsChildElement(uuid: string): boolean {
        if (uuid === this._uuid) {
            return true;
        }
        else {
            let sceneElements = this.getChildSceneElements();
            
            for (let i=0; i< sceneElements.length; i++) {
                if (sceneElements[i].getIsChildElement(uuid)) {
                    return true;
                } 
            }

            return false;
        }
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

    public setWidth(width: number): void {
        this._width = width;
    }

    public setContentObject(content: Object3D): void {
        this._content = content;
    }

    public async setCalculatedWidth(width: number): Promise<void> {
        return new Promise(async (resolve) => {
            if (!this._width) {
                let body = null;
                let child = null;
    
                for (let i=0; i<this._content.children.length; i++) {
                    if (this._content.children[i].name == "body") body = this._content.children[i];
                    else if (this._content.children[i].name == "child") child = this._content.children[i];
                }
    
                if (body && child) {
                    const contentBox = new Box3().setFromObject(body);

                    let xSize = (contentBox.max.x-contentBox.min.x);

                    if (xSize != width) {
                        let ySize = (contentBox.max.y-contentBox.min.y);

                        body.geometry.dispose();
                        body.geometry = PlaneUtils.getPlane(width, ySize, this._borderRadius)
                        body.geometry.computeBoundingBox();
                        body.geometry.computeBoundingSphere();
                    }
    
                    // This seems to cause a redraw
                    new Box3().setFromObject(body);
    
                    await this.resizeFullWidthPanels(body, child);
                }
            }

            resolve();
        });
    }

    public setHidden(): void {
        this._content.visible = false;
    }
    
    public setVisible(): void {
        this._content.visible = true;
    }

    public enableLayout(layoutId: string): void {
        const childElements = this.getChildSceneElements();

        for (let i=0; i<childElements.length; i++) {
            childElements[i].enableLayout(layoutId);
        }
    }

    public disableLayouts(): void {
        const childElements = this.getChildSceneElements();

        for (let i=0; i<childElements.length; i++) {
            childElements[i].disableLayouts();
        }
    }

    ////////// Public Methods

    // --- Data Methods

    public addChildElement(position: number, childElement: SceneElement): void {
        this._childElements.set(position, childElement);
    }

    // --- Rendering Methods
    
    public clicked(meshId: string): Promise<void> {
        return new Promise((resolve) => {
            let keys = Array.from(this.getChildElements().keys());

            for (let i=0; i< keys.length; i++) {
                const childElement = this.getChildElements().get(keys[i]);
                childElement.clicked(meshId);
            }
            
            let body;

            for (let i=0; i<this._content.children.length; i++) {
                if (this._content.children[i].name == "body") {
                    body = this._content.children[i];
                    break;
                }
            }

            if (body && (body.uuid === meshId) && (this.onClick)) {
                this.onClick();
            }
            
            resolve();
        });
    }

    public buildPanelMesh(): Mesh {
        let height = 0;

        if (this._height) height = this._height;
        else height = this._padding;

        let width = 0;

        if (this._width) width = this._width;
        else width = this._padding;

        let materialOptions;

        if ((this._color) && (this._color.length > 0)) {
            materialOptions = {
                color: new Color(this._color),
                side: DoubleSide
            };

            if (this._opacity < 1) {
                materialOptions["transparent"] = true;
                materialOptions["opacity"] = this._opacity;
            }
        }
        else {
            materialOptions = {
                color: new Color("#000000"),
                transparent: true,
                opacity: 0
            };
        }

        const material = MaterialUtils.getBasicMaterial(materialOptions);

        const geometry = PlaneUtils.getPlane(width, height, this._borderRadius);

        const main = new Mesh(geometry, material);
        main.recieveShadow = true;
        main.name = "body";

        return main;
    }

    public resizePanelBody(mesh: Mesh, childLayoutContainer: Object3D): void {
        const meshBox = new Box3().setFromObject(mesh);

        let normalizingBox = new Box3().setFromObject(childLayoutContainer);

        if (((normalizingBox.max.x-normalizingBox.min.x) > (meshBox.max.x-meshBox.min.x)) || 
            ((normalizingBox.max.y-normalizingBox.min.y) > (meshBox.max.y-meshBox.min.y))) {
            let xSize = ((normalizingBox.max.x-normalizingBox.min.x)+(this._padding*2));
            let ySize = ((normalizingBox.max.y-normalizingBox.min.y)+(this._padding*2));

            mesh.geometry.dispose();
            mesh.geometry = PlaneUtils.getPlane(xSize , ySize, this._borderRadius)
            mesh.geometry.computeBoundingBox();
            mesh.geometry.computeBoundingSphere();

            let scaledMeshBox = new Box3().setFromObject(mesh);
            
            if (this._verticalAlign == VerticalAlign.Top) mesh.position.y -= scaledMeshBox.max.y-meshBox.max.y;
            if (this._verticalAlign == VerticalAlign.Bottom) mesh.position.y += scaledMeshBox.max.y-meshBox.max.y;
            
            if (this._horizontalAlign == HorizontalAlign.Left) mesh.position.x += scaledMeshBox.max.x-meshBox.max.x;
            else if (this._horizontalAlign == HorizontalAlign.Right) mesh.position.x -= scaledMeshBox.max.x-meshBox.max.x;
        }
    }

    public repositionContainer(mesh: Mesh, childLayoutContainer: Object3D): void {
        const meshBox = new Box3().setFromObject(mesh);

        const totalBox = new Box3().setFromObject(childLayoutContainer);

        if (this._verticalAlign == VerticalAlign.Top) {
            childLayoutContainer.position.y += meshBox.max.y - totalBox.max.y - this._padding;
        }
        else if (this._verticalAlign == VerticalAlign.Bottom) {
            childLayoutContainer.position.y += meshBox.min.y - totalBox.min.y + this._padding;
        }

        if (this._horizontalAlign == HorizontalAlign.Left) {
            childLayoutContainer.position.x += meshBox.min.x - totalBox.min.x + this._padding;
        }
        else if (this._horizontalAlign == HorizontalAlign.Right) {
            childLayoutContainer.position.x += meshBox.max.x - totalBox.max.x - this._padding;
        }
    }

    public update(delta: number): void {
        const childElements = this.getChildSceneElements();

        for (let i=0; i<childElements.length; i++) {
            childElements[i].update(delta);
        }
    }

    ////////// Virtual Methods

    protected centerContentBox(childLayoutContainer: Object3D): void {};

    protected layoutChildrenItems(childLayoutContainer: Object3D): void {};

    protected resizeFullWidthPanels(mesh: Mesh, childLayoutContainer: Object3D): void {};
}