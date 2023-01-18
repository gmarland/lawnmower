import { 
    Mesh,
    Group,
    Vector3,
    CanvasTexture,
    LinearFilter
} from 'three';

import { Dimensions } from '../../geometry/Dimensions';
import { GeometryUtils } from '../../geometry/GeometryUtils';
import { MaterialUtils } from '../../geometry/MaterialUtils';
import { PlaneUtils } from '../../geometry/PlaneUtils';
import { MainScene } from '../../scene/MainScene';
import { SceneElementPlacement } from '../../scene/SceneElementPlacement';

import { SceneElement } from "../SceneElement";
import { LMLayout } from '../lm-layout/LMLayout';
import { LMTextConfig } from './LMTextConfig';

export class LMText implements SceneElement {
    private _parent: SceneElement;

    private _id: string;

    private _position?: Vector3;

    private _fontSize: number;
    private _fontFamily: string;

    private _italic: boolean;
    private _bold: boolean;

    private _text: string;

    private _initialWidth?: number = null; //Defined width from the HTML tag
    private _initialHeight?: number = null;
    
    private _calculatedWidth?: number = null; // Calculated through drawing the text
    
    // Set through the API, typically through a parent div
    private _setWidth?: number = null;
    private _setHeight?: number = null; 

    private _borderRadius: number;

    private _calculatedHeight?: number = null;

    private _backgroundColor: string = "";
    private _fontColor: string = "";

    private _padding: number = 0;

    private _mesh?: Mesh = null;
    private _content?: Group = new Group();

    private _initialized: boolean = false;

    private _drawing: boolean = false;
    private _redraw: boolean = false;

    public onClick?: Function = null;

    constructor(parent: SceneElement, position: Vector3, id: string, text: string, config: LMTextConfig) {
        this._parent = parent;

        this._position = position;

        this._id = id;
        
        this._text = text;
        
        this._fontFamily = config.fontFamily;
        this._fontSize = config.fontSize;

        this._italic = config.italic;
        this._bold = config.bold;

        if (config.width) this._initialWidth = config.width;
        if (config.height) this._initialHeight = config.height;

        this._borderRadius = config.borderRadius;
        
        if (config.backgroundColor) this._backgroundColor = config.backgroundColor;
        else this._backgroundColor = "#ffffff";
        
        if (config.fontColor) this._fontColor = config.fontColor;
        else this._fontColor = "#000000";

        if (config.padding) this._padding = config.padding;
        
        this._content.name = "text"
        this._content.translateZ(1);
    }

    ////////// Getters
    
    public get id(): string {
        return this._id;
    }
    
    public get uuid(): string {
        return this._content.uuid;
    }
    
    public get position(): Vector3 {
        return this._position;
    }

    public get dynamicWidth(): boolean {
        return (this._initialWidth == null);
    }

    public get width(): number {
        if (this._setWidth !== null) return this._setWidth;
        else return this._initialWidth ? this._initialWidth : 0;
    }

    public get height(): number {
        if (this._calculatedHeight !== null) return this._calculatedHeight;
        else if (this._setHeight !== null) return this._setHeight;
        else return this._initialHeight ? this._initialHeight : 0;
    }

    public get text(): string {
        return this._text;
    }
    
    public get borderRadius(): number {
        return this._borderRadius;
    }

    public get fontFamily(): string {
        return this._fontFamily;
    }

    public get italic(): boolean {
        return this._italic;
    }
    
    public get bold(): boolean {
        return this._bold;
    }
    
    public get fontSize(): number {
        return this._fontSize;
    }
    
    public get fontColor(): string {
        return this._fontColor;
    }

    public get backgroundColor(): string {
        return this._backgroundColor;
    }

    public get padding(): number {
        return this._padding;
    }

    public get visible(): boolean {
        return this._content.visible;
    }
    
    public getPlacementLocation(): SceneElementPlacement {
        return SceneElementPlacement.Main;
    }

    public async getContent(): Promise<Group> {
        return new Promise(async (resolve) => {
            if (!this._initialized) await this.draw();
            
            resolve(this._content);
        });
    }

    public getDimensions(): Dimensions {
        return {
            width: this.width,
            height: this.height
        }
    }
    
    public async getPosition(): Promise<Vector3> {
        return new Promise(async (resolve) => {
            if (!this._initialized) await this.draw();
    
            resolve(this._content.position);
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

    ////////// Setters

    public set id(value: string) {
        this._id = value;
    }
    
    public set position(value: Vector3) {
        this._position = value;
    }

    public set width(value: number) {
        this._setWidth = value;
    }

    public set height(value: number) {
        this._setHeight = value;
    }

    public set text(value: string) {
        this._text = value;
    }
    
    public set borderRadius(value: number) {
        this._borderRadius = value;
    }

    public set fontFamily(value: string) {
        this._fontFamily = value;
    }

    public set italic(value: boolean) {
        this._italic = value;
    }
    
    public set bold(value: boolean) {
        this._bold = value;
    }
    
    public set fontSize(value: number) {
        this._fontSize = value;
    }
    
    public set fontColor(value: string) {
        this._fontColor = value;
    }

    public set backgroundColor(value: string) {
        this._backgroundColor = value;
    }

    public set padding(value: number) {
        this._padding = value;
    }

    public set visible(value: boolean) {
        this._content.visible = value;
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

    ////////// Public Methods

    // --- Data Methods

    public addChildElement(position: number, childElement: SceneElement): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    public removeChildElement(childElement: SceneElement): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }
    
    // --- Rendering Methods

    public async draw(): Promise<boolean> {
        this._initialized = true;

        return new Promise(async (resolve) => {
            if (!this._drawing) {
                this._drawing = true;
                this._redraw = false;

                const currentDimensions = GeometryUtils.getDimensions(this._content);

                this._calculatedWidth = null;
                this._calculatedHeight = null;
    
                await this.generateContent(this.width, this.height);
                    
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
        if (updatedDimensions || (this._parent instanceof LMLayout)) await this._parent.drawParent();
    }

    public clicked(meshId: string): Promise<void> {
        return new Promise((resolve) => {
            if (this._mesh && (this._mesh.uuid === meshId) && (this.onClick)) {
                this.onClick();
            }
            resolve();
        });
    }

    public update(delta: number): void {
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

    private async generateContent(width: number, height: number): Promise<void> {
        return new Promise(async (resolve) => {
            this._content.clear();

            this.destroyMesh();
            
            this._mesh = this.buildMesh(width, height);
                    
            this._content.add(this._mesh);

            resolve();
        });
    }

    private buildMesh(width: number, height: number): Mesh {
        const textTexture = this.buildTexture(width, height);

        let buildWidth = 0;
        if (this._calculatedWidth) buildWidth = this._calculatedWidth;
        
        const geometry = PlaneUtils.getPlane(buildWidth, this._calculatedHeight, this._borderRadius);
        
        const material = MaterialUtils.getBasicMaterial({
            map: textTexture,
            transparent: false
        });
        
        const mesh = new Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.recieveShadow = true;
    
        if (this._borderRadius > 0) PlaneUtils.generateMeshUVs(mesh);

        return mesh;
    }

    private buildTexture(width: number, height: number): CanvasTexture {
        let textDecoration = "";

        if (this._bold) textDecoration += "bold ";
        if (this._italic) textDecoration += "italic ";

        const textContainer = document.createElement("canvas");
        textContainer.style.width = width + "px"
        textContainer.width = width;

        const context = textContainer.getContext('2d', {alpha: false});
        context.font = textDecoration + this._fontSize + "px " + this._fontFamily;

        const allLines = [];
        
        this._text.split("\n\r").forEach((nrline) => {
            nrline.split("\n").forEach((nline) => {
                allLines.push(nline.trim());
            });
        });
        
        let lines = Array<string>();

        if (allLines.length > 0) {
            if (width) {
                this._calculatedWidth = width;

                for (let i=0; i<allLines.length; i++) {
                    let currentLine = "";

                    const words = allLines[i].split(" ");
                    
                    if (words.length > 0) {
                        if (words.length === 1) {
                            lines.push(words[0]);
                        }
                        else if (words.length > 1) {
                            for (let j=0; j<words.length; j++) {
                                let word = words[j];

                                if (word.trim().length > 0) {
                                    const newTextLenth = context.measureText(currentLine + " " + word).width + (this._padding*2);
                                    
                                    if (newTextLenth < width) {
                                        currentLine += " " + word;
                                    }
                                    else {
                                        lines.push(currentLine.trim());

                                        currentLine = word;
                                    }
                                }
                            }

                            if (currentLine.trim().length > 0) lines.push(currentLine.trim());
                        }
                    }
                    else {
                        lines.push("");
                    }
                }
            }
            else {
                lines = allLines;
            
                for (let i=0; i<lines.length; i++) {
                    const newTextLenth = context.measureText(lines[i]).width + (this._padding*2);
                    if (newTextLenth > this._calculatedWidth) this._calculatedWidth = newTextLenth;
                }
            }
        }
        
        const textDimensions = context.measureText(this._text);

        const lineHeight = textDimensions.fontBoundingBoxAscent + textDimensions.fontBoundingBoxDescent;

        textContainer.style.width = this._calculatedWidth + "px"
        textContainer.width = this._calculatedWidth;
        
        if (height) this._calculatedHeight = height;
        else this._calculatedHeight = (lineHeight*lines.length) + (this._padding*2);

        textContainer.style.height = this._calculatedHeight + "px"
        textContainer.height = this._calculatedHeight;
        
        context.font = textDecoration + this._fontSize + "px " + this._fontFamily;

        context.clearRect(0, 0, this._calculatedWidth, this._calculatedHeight);

        context.fillStyle = this._backgroundColor;
        context.fillRect(0, 0, this._calculatedWidth, this._calculatedHeight)

        context.fillStyle = this._fontColor;

        for (let i = 0; i<lines.length; i++) {
            const writePosition = this._padding + (lineHeight*(i+1)) - textDimensions.actualBoundingBoxDescent;

            context.fillText(lines[i], this._padding, writePosition);
        }
        
        const textTexture = new CanvasTexture(context.canvas);
        textTexture.generateMipmaps = false;
        textTexture.minFilter = LinearFilter;
        textTexture.magFilter = LinearFilter;
        textTexture.needsUpdate = true;
        
        const aspect = (this._calculatedWidth/textTexture.image.width);

        textTexture.repeat.set(aspect, aspect);

        return textTexture;
    }

    private destroyMesh(): void {
        if (this._mesh) {
            this._mesh.geometry.dispose();
            this._mesh.material.dispose();
            this._mesh = null;
        }
    }
}