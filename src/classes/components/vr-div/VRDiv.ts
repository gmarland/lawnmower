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
import { GeometryUtils } from '../../geometry/GeometryUtils';

export class VRDiv implements SceneElement {
    private _depth: number;

    private _parent: SceneElement;

    private _uuid: string;

    private _initialWidth?: number; 
    private _initialHeight?: number;
    private _borderRadius: number;

    private _setWidth?: number = null

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
    
    private _initialized: boolean = false;
    
    private _drawing: boolean = false;
    private _redraw: boolean = false;

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

        if(config.width) this._initialWidth = config.width;
        if(config.height) this._initialHeight = config.height;

        this._borderRadius = config.borderRadius;
        
        this._color = config.color;

        if (config.opacity) this._opacity = config.opacity;
        
        if (config.padding) this._padding = config.padding;
        if (config.margin) this._margin = config.margin;

        this._xRotation = config.xRotation;
        this._yRotation = config.yRotation;
        this._zRotation = config.zRotation;
        
        this._content.translateZ(0.5);
    }

    ////////// Getters
    
    public get uuid(): string {
        return this._uuid;
    }

    public get dynamicWidth(): boolean {
        return true;
    }

    public get width() {
        if (this._setWidth !== null) return this._setWidth;
        else return this._initialWidth;
    }

    public get visible(): boolean {
        return this._content.visible;
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
            width: this._initialWidth,
            height: this._initialHeight
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

    public getInitialized(): boolean {
        return this._initialized;
    }
     
    public async getPosition(): Promise<Vector3> {
        return new Promise(async (resolve) => {
            if (!this._initialized) await this.getContent(); 
    
            resolve(this._content.position);
        });
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
                ((this._parent as VRLayout).id == layoutId)) {
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

    public set width(value: number) {
        this._setWidth = value;
    }

    public set visible(value: boolean) {
        this._content.visible = value;
    }

    public setInitialized(initialized: boolean): void {
        this._initialized = initialized;
    }

    public enableLayout(layoutId: string): Promise<void> {
        return new Promise(async (resolve) => {
            const childElements = this.getChildSceneElements();
    
            for (let i=0; i<childElements.length; i++) {
                await childElements[i].enableLayout(layoutId);
            }
            
            resolve();
        });
    }

    public disableLayouts(): Promise<void> {
        return new Promise(async (resolve) => {
            const childElements = this.getChildSceneElements();
    
            for (let i=0; i<childElements.length; i++) {
                await childElements[i].disableLayouts();
            }

            resolve();
        });
    }

    ////////// Public Methods

    // --- Data Methods

    public addChildElement(position: number, childElement: SceneElement): void {
        this._childElements.set(position, childElement);
    }

    // --- Rendering Methods

    public async draw(): Promise<boolean> {
        return new Promise(async (resolve) => {
            if (!this._drawing) {
                this._drawing = true;
                this._redraw = false;

                const currentDimensions = GeometryUtils.getDimensions(this._content);

                if (this._setWidth !== null) await this.updateContent(this._setWidth);
                else await this.updateContent(this._initialWidth);   

                this._drawing = false;
                
                if (this._redraw) {
                    await this.draw();
                    
                    const newDimensions = GeometryUtils.getDimensions(this._content);

                    resolve(((currentDimensions.width !== newDimensions.width) || (currentDimensions.height !== newDimensions.height)));
                }
                else {
                    const newDimensions = GeometryUtils.getDimensions(this._content);

                    resolve(((currentDimensions.width !== newDimensions.width) || (currentDimensions.height !== newDimensions.height)));
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
        if (updatedDimensions) await this._parent.drawParent();
    }
    
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

        if (this._initialHeight) height = this._initialHeight;
        else height = this._padding;

        let width = 0;

        if (this._initialWidth) width = this._initialWidth;
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
        const childBox = new Box3().setFromObject(childLayoutContainer);

        let bodyXSize = (meshBox.max.x-meshBox.min.x);
        if (isNaN(bodyXSize) || !isFinite(bodyXSize)) bodyXSize = (this._padding*2);

        let bodyYSize = (meshBox.max.y-meshBox.min.y);
        if (isNaN(bodyYSize) || !isFinite(bodyYSize)) bodyYSize = (this._padding*2);

        let childXSize = ((childBox.max.x-childBox.min.x)+(this._padding*2));
        if (isNaN(childXSize) || !isFinite(childXSize)) childXSize = (this._padding*2);

        let childYSize = ((childBox.max.y-childBox.min.y)+(this._padding*2));
        if (isNaN(childYSize) || !isFinite(childYSize)) childYSize = (this._padding*2);

        if ((childXSize !== bodyXSize) || 
            (childYSize !== bodyYSize)) {
            mesh.geometry.dispose();
            mesh.geometry = PlaneUtils.getPlane(childXSize, childYSize, this._borderRadius)
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

    public async updateContent(width: number): Promise<void> {
        return new Promise(async (resolve) => {
            let body = null;
            let child = null;

            for (let i=0; i<this._content.children.length; i++) {
                if (this._content.children[i].name == "body") body = this._content.children[i];
                else if (this._content.children[i].name == "child") child = this._content.children[i];
            }

            if (body && child) {
                await this.generateContent(body, child);

                this.resizePanelBody(body, child);
            }
            
            resolve();
        });
    }

    protected generateContent(body: Mesh, childLayoutContainer: Object3D): any {};

    protected centerContentBox(childLayoutContainer: Object3D): void {};

    protected layoutChildrenItems(childLayoutContainer: Object3D): void {};

    protected resizeFullWidthPanels(width: number, childLayoutContainer: Object3D): any {};

    protected resetChildPositions(childLayoutContainer: Object3D): void {};
}