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
import { MeshUtils } from '../../geometry/MeshUtils';
import { PlaneUtils } from '../../geometry/PlaneUtils';
import { MainScene } from '../../scene/MainScene';
import { SceneElementPlacement } from '../../scene/SceneElementPlacement';

import { SceneElement } from "../SceneElement";
import { VRLayout } from '../vr-layout/VRLayout';
import { VRTextConfig } from './VRTextConfig';

export class VRText implements SceneElement {
    private _parent: SceneElement;

    private _uuid: string;

    private _fontSize: number;
    private _fontFamily: string;

    private _italic: boolean;
    private _bold: boolean;

    private _text: string;

    private _initialWidth: number = 0; //Defined width from the HTML tag
    private _initialHeight: number = 0;
    
    private _calculatedWidth?: number = null; // Calculated through drawing the text
    
    private _setWidth?: number = null; // Set through the API, typically through a parent div

    private _borderRadius: number;

    private _calculatedHeight: number;

    private _backgroundColor: string = "";
    private _fontColor: string = "";

    private _padding: number = 0;

    private _mesh?: Mesh = null;
    private _content?: Group = new Group();

    private _initialized: boolean = false;
    
    private _drawing: boolean = false;
    private _redraw: boolean = false;

    public onClick?: Function = null;

    constructor(parent: SceneElement, text: string, config: VRTextConfig) {
        this._parent = parent;

        this._uuid = MeshUtils.generateId();
        
        this._fontFamily = config.fontFamily;
        this._fontSize = config.fontSize;

        this._italic = config.italic;
        this._bold = config.bold;
        
        this._text = text;

        this._initialWidth = config.width;
        this._initialHeight = config.height;

        this._borderRadius = config.borderRadius;
        
        if (config.backgroundColor) this._backgroundColor = config.backgroundColor;
        else this._backgroundColor = "#ffffff";
        
        if (config.fontColor) this._fontColor = config.fontColor;
        else this._fontColor = "#000000";

        if (config.padding) this._padding = config.padding;
        
        this._content.name = "text"
        this._content.translateZ(0.5);
    }

    ////////// Getters
    
    public get uuid(): string {
        return this._uuid;
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

    public async getContent(): Promise<Group> {
        return new Promise(async (resolve) => {
            if (!this._initialized) await this.draw();
            
            resolve(this._content);
        });
    }

    public getDimensions(): Dimensions {
        return {
            width: this._initialWidth,
            height: this._calculatedHeight
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
        return uuid === this._uuid;
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

    public addChildElement(position: number, childElement: SceneElement): void {
    }
    
    // --- Rendering Methods

    public async draw(): Promise<boolean> {
        this._initialized = true;

        return new Promise(async (resolve) => {
            if (!this._drawing) {
                this._drawing = true;
                this._redraw = false;

                const currentDimensions = GeometryUtils.getDimensions(this._content);

                if (this._setWidth !== null) await this.generateContent(this._setWidth);
                else await this.generateContent(this._initialWidth);
                    
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
            if (this._mesh && (this._mesh.uuid === meshId) && (this.onClick)) {
                this.onClick();
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
            
            this._mesh = this.buildMesh(width);

            this._content.add(this._mesh);

            resolve();
        });
    }

    private buildMesh(width: number): Mesh {
        const textTexture = this.buildTexture(width);

        let buildWidth = 0;
        if (this._calculatedWidth) buildWidth = this._calculatedWidth;
        
        const geometry = PlaneUtils.getPlane(buildWidth, this._calculatedHeight, this._borderRadius);
        
        const material = MaterialUtils.getBasicMaterial({
            map: textTexture,
            transparent: false
        });
        
        material.map.minFilter = LinearFilter;
        
        const mesh = new Mesh(geometry, material);
        mesh.recieveShadow = true;
    
        if (this._borderRadius > 0) PlaneUtils.generateMeshUVs(mesh);

        return mesh;
    }

    private buildTexture(width: number): CanvasTexture {
        let textDecoration = "";

        if (this._bold) textDecoration += "bold ";
        if (this._italic) textDecoration += "italic ";

        const textContainer = document.createElement("canvas");
        textContainer.style.width = width + "px"
        textContainer.width = width;

        const context = textContainer.getContext('2d', {alpha: false});
        context.font = textDecoration + this._fontSize + "px " + this._fontFamily;

        const words = this._text.split(" ");
        const lines = Array<string>();

        if (words.length > 0) {
            let currentLine = "";

            if (width) {
                this._calculatedWidth = width;

                if (words.length > 1) {
                    for (let i=0; i<words.length; i++) {
                        if (words[i].trim().length > 0) {
                            let word = words[i];

                            let breakAfter = false;

                            if (word.startsWith("\n\r") || word.startsWith("\n")) {
                                lines.push("");
                            }

                            if (word.endsWith("\n\r") || word.endsWith("\n")) {
                                breakAfter = true;
                            }
                            
                            word = word.replace(/[\n\r]/g, '');

                            const newTextLenth = context.measureText(currentLine + " " + word).width + (this._padding*2);
                            
                            if (newTextLenth < width) {
                                currentLine += " " + word;
                            }
                            else {
                                lines.push(currentLine.trim());

                                currentLine = word;
                            }

                            if (breakAfter) {
                                if (currentLine.trim().length > 0) lines.push(currentLine.trim());
                                lines.push("");

                                currentLine = "";
                            }
                        }
                    }
                }

                if (currentLine.trim().length > 0) lines.push(currentLine.trim());
            }
            else {
                if (words.length > 1) {
                    for (let i=0; i<words.length; i++) {
                        if (words[i].trim().length > 0) {
                            let word = words[i];

                            let breakAfter = false;

                            if (word.startsWith("\n\r") || word.startsWith("\n")) {
                                lines.push("");
                            }

                            if (word.endsWith("\n\r") || word.endsWith("\n")) {
                                breakAfter = true;
                            }
                            
                            currentLine += " " + word.replace(/[\n\r]/g, '');

                            if (breakAfter) {
                                if (currentLine.trim().length > 0) lines.push(currentLine.trim());
                                lines.push("");

                                currentLine = "";
                            }
                        }
                    }

                    if (currentLine.trim().length > 0) lines.push(currentLine.trim());
        
                    this._calculatedWidth = 0;

                    for (let i=0; i<lines.length; i++) {
                        const newTextLenth = context.measureText(lines[i]).width + (this._padding*2);
                        if (newTextLenth > this._calculatedWidth) this._calculatedWidth = newTextLenth;
                    }
                }
            }
        }
        
        const textDimensions = context.measureText(this._text);

        const lineHeight = textDimensions.fontBoundingBoxAscent + textDimensions.fontBoundingBoxDescent;

        this._calculatedHeight;

        textContainer.style.width = this._calculatedWidth + "px"
        textContainer.width = this._calculatedWidth;
        
        if (this._initialHeight) this._calculatedHeight = this._initialHeight;
        else this._calculatedHeight = (lineHeight*lines.length) + (this._padding*2);

        textContainer.style.height = this._calculatedHeight + "px"
        textContainer.height = this._calculatedHeight;
        
        context.font = textDecoration + this._fontSize + "px " + this._fontFamily;

        context.clearRect(0, 0, this._calculatedWidth, this._calculatedHeight);

        context.fillStyle = this._backgroundColor;
        context.fillRect(0, 0, this._calculatedWidth, this._calculatedHeight)

        context.fillStyle = this._fontColor;

        for (let i = 0; i<lines.length; i++) {
            let writePosition;
            
            if (i === 0) writePosition = this._padding + (lineHeight*(i+1)) - textDimensions.actualBoundingBoxDescent;
            else writePosition = this._padding + (lineHeight*(i+1));

            context.fillText(lines[i], this._padding, writePosition);
        }
        
        const textTexture = new CanvasTexture(context.canvas);
        textTexture.needsUpdate = true;
        
        const aspect = (this._calculatedWidth/textTexture.image.width);

        textTexture.repeat.set(aspect, aspect);

        return textTexture;
    }
}