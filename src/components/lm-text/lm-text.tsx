import { 
  Component, 
  Host, 
  h, 
  Element, 
  Prop,
  Event,
  EventEmitter,
  Watch
} from '@stencil/core';

import { ISceneElement } from '../../classes/components/ISceneElement';
import { LMText } from '../../classes/components/lm-text/LMText';
import { Method } from '@stencil/core/internal';
import { GeometryUtils } from '../../classes/geometry/GeometryUtils';
import { TextAlignment } from '../../classes/components/constants/TextAlignment';

@Component({
  tag: 'lm-text',
  styleUrl: 'lm-text.scss',
  shadow: false
})
export class LmText {
  // *** Required for positioning ***

  @Prop() public parent: ISceneElement;

  @Prop() public sequenceNo: number;

  @Prop() public vrEnabled: boolean = true;

  @Prop() public shadowsEnabled: boolean = true;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop() public offset: number;

  @Prop() public position: string;

  @Prop({ mutable: true }) public sceneElement: LMText;

  @Prop({ reflect: true }) public id: string = "";

  @Prop({ mutable: true }) public text: string;

  @Prop() public width?: number;

  @Prop() public height?: number;

  @Prop() public borderRadius: number = 0;

  @Prop() public textAlignment: string = "Center";

  @Prop() public fontFamily: string = "Arial";

  @Prop() public fontSize: number = 18;

  @Prop() public fontColor: string;

  @Prop() public textDecoration: string;
  
  @Prop() public backgroundColor: string;

  @Prop() public padding?: number;

  @Prop() public visible: boolean = true;

  @Event() public click: EventEmitter;

  @Watch('id')
  private updateId(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.id = newValue;
      }

      resolve();
    });
  }

  @Watch('width')
  private updateWidth(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.width = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('height')
  private updateHeight(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.height = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('text')
  private updateText(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.text = newValue;
        this.el.innerHTML = newValue;
        
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('borderRadius')
  private updateBorderRadius(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.borderRadius = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('fontFamily')
  private updateFontFamily(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.fontFamily = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('textAlignment')
  private updateTextAlignment(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.textAlignment = TextAlignment[newValue];
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('fontSize')
  private updateFontSize(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.fontSize = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('fontColor')
  private updateFontColor(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.fontColor = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('textDecoration')
  private updateTextDecoration(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        let bold = false;
        let italic = false;
    
        if (newValue) {
          const decorations = newValue.split(" ");
          
          for (let i=0; i<decorations.length; i++) {
            if (decorations[i].toLowerCase() == "bold") bold = true;
            if (decorations[i].toLowerCase() == "italic") italic = true;
          }
        }

        this.sceneElement.bold = bold;
        this.sceneElement.italic = italic;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('backgroundColor')
  private updateBackgroundColor(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.backgroundColor = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('padding')
  private updatePadding(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.padding = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('visible')
  private updateVisible(newValue: boolean): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.visible = newValue;
  
        await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Method()
  public async destroy(): Promise<void> {
    return new Promise(async (resolve) => {
      this.el.remove();

      await this.sceneElement.destroy();
      
      resolve();
    });
  }

  componentWillLoad() {
    let bold = false;
    let italic = false;

    if (!this.text) this.text = this.el.innerHTML;
    else this.el.innerHTML = this.text;

    if (this.textDecoration) {
      const decorations = this.textDecoration.split(" ");
      
      for (let i=0; i<decorations.length; i++) {
        if (decorations[i].toLowerCase() == "bold") bold = true;
        if (decorations[i].toLowerCase() == "italic") italic = true;
      }
    }

    this.sceneElement = new LMText(this.parent, GeometryUtils.parsePositionString(this.position), this.id, this.text, { 
      shadowsEnabled: this.shadowsEnabled,
      textAlignment: TextAlignment[this.textAlignment],
      fontFamily: this.fontFamily,
      fontSize: this.fontSize,
      fontColor: this.fontColor,
      bold: bold,
      italic: italic,
      width: this.width, 
      height: this.height, 
      borderRadius: this.borderRadius,
      backgroundColor: this.backgroundColor,
      padding: this.padding,
      offset: this.offset
    });

    this.sceneElement.onClick = () => {
      this.click.emit();
    };
  }

  componentDidLoad() {
    this.parent.addChildElement(this.sequenceNo, this.sceneElement);
  }
  
  render() {
    return (
      <Host />
    );
  }
}
