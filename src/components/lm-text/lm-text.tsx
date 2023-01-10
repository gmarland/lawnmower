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

import { SceneElement } from '../../classes/components/SceneElement';
import { LMText } from '../../classes/components/lm-text/LMText';

@Component({
  tag: 'lm-text',
  styleUrl: 'lm-text.scss',
  shadow: true,
})
export class LmText {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  @Prop() public position: number;

  @Prop() public depth: number;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop({ mutable: true }) public text: string;

  @Prop() public width?: number;

  @Prop() public height?: number;

  @Prop() public borderRadius: number = 0;

  @Prop() public fontFamily: string = "Arial";

  @Prop() public fontSize: number = 18;

  @Prop() public fontColor: string;

  @Prop() public textDecoration: string;
  
  @Prop() public backgroundColor: string;

  @Prop() public padding?: number;

  @Prop() public visible: boolean = true;

  @Event() public click: EventEmitter;

  private _textblock: LMText;

  @Watch('width')
  private updateWidth(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._textblock) {
        this._textblock.width = newValue;
  
        const dimensionsUpdated = await this._textblock.draw();
        if (dimensionsUpdated) await this._textblock.drawParent();
      }

      resolve();
    });
  }

  @Watch('height')
  private updateHeight(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._textblock) {
        this._textblock.height = newValue;
  
        const dimensionsUpdated = await this._textblock.draw();
        if (dimensionsUpdated) await this._textblock.drawParent();
      }

      resolve();
    });
  }

  @Watch('text')
  private updateText(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._textblock) {
        this._textblock.text = newValue;
  
        const dimensionsUpdated = await this._textblock.draw();
        if (dimensionsUpdated) await this._textblock.drawParent();
      }

      resolve();
    });
  }

  @Watch('borderRadius')
  private updateBorderRadius(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._textblock) {
        this._textblock.borderRadius = newValue;
  
        const dimensionsUpdated = await this._textblock.draw();
        if (dimensionsUpdated) await this._textblock.drawParent();
      }

      resolve();
    });
  }

  @Watch('fontFamily')
  private updateFontFamily(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._textblock) {
        this._textblock.fontFamily = newValue;
  
        const dimensionsUpdated = await this._textblock.draw();
        if (dimensionsUpdated) await this._textblock.drawParent();
      }

      resolve();
    });
  }

  @Watch('fontSize')
  private updateFontSize(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._textblock) {
        this._textblock.fontSize = newValue;
  
        const dimensionsUpdated = await this._textblock.draw();
        if (dimensionsUpdated) await this._textblock.drawParent();
      }

      resolve();
    });
  }

  @Watch('fontColor')
  private updateFontColor(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._textblock) {
        this._textblock.fontColor = newValue;
  
        const dimensionsUpdated = await this._textblock.draw();
        if (dimensionsUpdated) await this._textblock.drawParent();
      }

      resolve();
    });
  }

  @Watch('textDecoration')
  private updateTextDecoration(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._textblock) {
        let bold = false;
        let italic = false;
    
        if (newValue) {
          const decorations = newValue.split(" ");
          
          for (let i=0; i<decorations.length; i++) {
            if (decorations[i].toLowerCase() == "bold") bold = true;
            if (decorations[i].toLowerCase() == "italic") italic = true;
          }
        }

        this._textblock.bold = bold;
        this._textblock.italic = italic;
  
        const dimensionsUpdated = await this._textblock.draw();
        if (dimensionsUpdated) await this._textblock.drawParent();
      }

      resolve();
    });
  }

  @Watch('backgroundColor')
  private updateBackgroundColor(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._textblock) {
        this._textblock.backgroundColor = newValue;
  
        const dimensionsUpdated = await this._textblock.draw();
        if (dimensionsUpdated) await this._textblock.drawParent();
      }

      resolve();
    });
  }

  @Watch('padding')
  private updatePadding(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._textblock) {
        this._textblock.padding = newValue;
  
        const dimensionsUpdated = await this._textblock.draw();
        if (dimensionsUpdated) await this._textblock.drawParent();
      }

      resolve();
    });
  }

  @Watch('visible')
  private updateVisible(newValue: boolean): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._textblock) {
        this._textblock.visible = newValue;
  
        await this._textblock.drawParent();
      }

      resolve();
    });
  }

  componentWillLoad() {
    let bold = false;
    let italic = false;

    this.text = this.el.innerHTML;

    if (this.textDecoration) {
      const decorations = this.textDecoration.split(" ");
      
      for (let i=0; i<decorations.length; i++) {
        if (decorations[i].toLowerCase() == "bold") bold = true;
        if (decorations[i].toLowerCase() == "italic") italic = true;
      }
    }

    this._textblock = new LMText(this.parent, this.text, { 
      fontFamily: this.fontFamily,
      fontSize: this.fontSize,
      fontColor: this.fontColor,
      bold: bold,
      italic: italic,
      width: this.width, 
      height: this.height, 
      borderRadius: this.borderRadius,
      backgroundColor: this.backgroundColor,
      padding: this.padding
    });

    this._textblock.onClick = () => {
      this.click.emit();
    };
  }

  componentDidLoad() {
    this.parent.addChildElement(this.position, this._textblock);
  }
  
  render() {
    return (
      <Host />
    );
  }
}
