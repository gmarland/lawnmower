import { 
  Component, 
  Host, 
  h, 
  Element, 
  Prop,
  Event,
  EventEmitter
} from '@stencil/core';

import { SceneElement } from '../../classes/components/SceneElement';
import { VRText } from '../../classes/components/vr-text/VRText';

@Component({
  tag: 'vr-text',
  styleUrl: 'vr-text.scss',
  shadow: true,
})
export class VrText {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  @Prop() public position: number;

  @Prop() public depth: number;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop() public width: number;

  @Prop() public height: number;

  @Prop() public borderRadius: number = 0;

  @Prop() public fontFamily: string = "Arial";

  @Prop() public fontSize: number = 18;

  @Prop() public fontColor: string;

  @Prop() public textDecoration: string;
  
  @Prop() public backgroundColor: string;

  @Prop() public padding?: number;

  @Event() public onClick: EventEmitter;

  private _textblock: VRText;

  componentWillLoad() {
    let bold = false;
    let italic = false;

    if (this.textDecoration) {
      const decorations = this.textDecoration.split(" ");
      
      for (let i=0; i<decorations.length; i++) {
        if (decorations[i].toLowerCase() == "bold") bold = true;
        if (decorations[i].toLowerCase() == "italic") italic = true;
      }
    }

    this._textblock = new VRText(this.parent, this.el.innerHTML, { 
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
      this.onClick.emit();
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
