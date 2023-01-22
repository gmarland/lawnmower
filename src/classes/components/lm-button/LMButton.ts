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
import { BaseSceneElement } from '../BaseSceneElement';
import { TextAlignment } from '../constants/TextAlignment';

import { ISceneElement } from "../ISceneElement";
import { LMLayout } from '../lm-layout/LMLayout';
import { LMButtonConfig } from './LMButtonConfig';

export class LMButton extends BaseSceneElement implements ISceneElement {
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

    private _textAlignment = TextAlignment.Center;
    
    private _backgroundColor: string = "";
    private _fontColor: string = "";

    private _padding: number = 0;

    private _mesh?: Mesh = null;

    private _drawing: boolean = false;
    private _redraw: boolean = false;

    public onClick?: Function = null;

    constructor(parent: ISceneElement, position: Vector3, id: string, text: string, config: LMButtonConfig) {
        let offset = null;
        if (config.offset) offset = config.offset;
        
        super(parent, config.shadowsEnabled, position, id, offset);

        this._text = text;
        
        this._fontFamily = config.fontFamily;
        this._fontSize = config.fontSize;

        this._italic = config.italic;
        this._bold = config.bold;

        if (config.width) this._initialWidth = config.width;
        if (config.height) this._initialHeight = config.height;

        this._borderRadius = config.borderRadius;

        this._textAlignment = config.textAlignment;
        
        if (config.backgroundColor) this._backgroundColor = config.backgroundColor;
        else this._backgroundColor = "#ffffff";
        
        if (config.fontColor) this._fontColor = config.fontColor;
        else this._fontColor = "#000000";

        if (config.padding) this._padding = config.padding;
        
        this.content.name = "text"
        this.content.translateZ(1);
    }

    ////////// Getters
    
    public get placementLocation(): SceneElementPlacement {
        return SceneElementPlacement.Main;
    }

    public get dimensions(): Dimensions {
        return {
            width: this.width,
            height: this.height
        }
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

    public get textAlignment(): TextAlignment {
        return this._textAlignment;
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

    ////////// Setters

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

    public set textAlignment(value: TextAlignment) {
        this._textAlignment = value;
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
    
    public getChildSceneElements(): ISceneElement[] {
        return [];
    }

    public addChildElement(position: number, childElement: ISceneElement): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    public removeChildElement(childElement: ISceneElement): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }
    
    // --- Rendering Methods
    
    public async getPosition(): Promise<Vector3> {
        return new Promise(async (resolve) => {
            if (!this.initialized) await this.draw();
    
            resolve(this.content.position);
        });
    }

    public async getContent(): Promise<Group> {
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
        this.initialized = true;

        return new Promise(async (resolve) => {
            if (!this._drawing) {
                this._drawing = true;
                this._redraw = false;

                const currentDimensions = GeometryUtils.getDimensions(this.content);

                this._calculatedWidth = null;
                this._calculatedHeight = null;
    
                await this.generateContent(this.width, this.height);
                    
                this._drawing = false;
                    
                if (this._redraw) {
                    await this.draw();
                    
                    const newDimensions = GeometryUtils.getDimensions(this.content);

                    resolve(((currentDimensions.width !== newDimensions.width) || (currentDimensions.height !== newDimensions.height)));
                }
                else {
                    const newDimensions = GeometryUtils.getDimensions(this.content);

                    resolve(((currentDimensions.width !== newDimensions.width) || (currentDimensions.height !== newDimensions.height)));
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

    private async generateContent(width: number, height: number): Promise<void> {
        return new Promise(async (resolve) => {
            this.content.clear();

            this.destroyMesh();
            
            this._mesh = this.buildMesh(width, height);
                    
            this.content.add(this._mesh);

            resolve();
        });
    }

    private buildMesh(width: number, height: number): Mesh {
        const textTexture = this.buildTexture(width, height);

        let buildWidth = 0;
        if (this._calculatedWidth) buildWidth = this._calculatedWidth;
        
        const geometry = PlaneUtils.getPlane(buildWidth, this._calculatedHeight, this._borderRadius);
        
        const materialOptions = {
            map: textTexture,
            transparent: false
        };

        const material = MaterialUtils.getBasicMaterial(materialOptions);
        
        const mesh = new Mesh(geometry, material);
        
        if (this.shadowsEnabled) {
            if ((this.offset != null) && (this.offset !== 0)) mesh.castShadow = true;
            else mesh.castShadow = false;

            mesh.receiveShadow = true;
        }
        else {
            mesh.receiveShadow = false;
            mesh.castShadow = false;
        }
    
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

        const centerPosition = this._calculatedWidth/2;

        for (let i = 0; i<lines.length; i++) {
            const writePosition = this._padding + (lineHeight*(i+1)) - textDimensions.actualBoundingBoxDescent;

            const lineWidth = context.measureText(lines[i]).width;
    
            if (this._textAlignment == TextAlignment.Left) {
                context.fillText(lines[i], this._padding, writePosition);
            }
            else if (this._textAlignment == TextAlignment.Center) {
                context.fillText(lines[i], centerPosition-(lineWidth/2), writePosition);
            }
            else if (this._textAlignment == TextAlignment.Right) {
                context.fillText(lines[i], this._calculatedWidth-lineWidth-this._padding, writePosition);
            }
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