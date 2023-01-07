import { 
  Component, 
  Host, 
  h,
  Prop,
  Element,
  Event,
  EventEmitter,
  getAssetPath,
  Method
} from '@stencil/core';

import { SceneElement } from '../../classes/components/SceneElement';
import { VRModal } from '../../classes/components/vr-modal/VRModal';

@Component({
  tag: 'vr-modal',
  styleUrl: 'vr-modal.scss',
  shadow: true,
})
export class VrModal {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop() public id: string = "";

  @Prop() public src: string;

  @Prop() public borderRadius: number = 0;
  
  @Prop() public width: number = 1000;
  
  @Prop() public height?: number;
  
  @Prop() public offset: number = 50;
  
  @Prop() public padding: number = 10;

  @Prop() public borderColor: string =  "#ffffff";

  @Prop() public borderWidth: number = 0;

  @Prop() public backgroundColor: string = "#222222";

  @Prop() public closeButtonWidth: number = 50;

  @Event() public click: EventEmitter;

  @Event() public addToRoot: EventEmitter<SceneElement>;

  private _modal: VRModal;

  @Method()
  public async getId(): Promise<string> {
    return new Promise((resolve) => {
      resolve(this.id);
    });
  }

  @Method()
  public async getUUID(): Promise<string> {
    return new Promise((resolve) => {
      resolve(this._modal.uuid);
    });
  }

  @Method()
  public async show(): Promise<void> {
    return new Promise((resolve) => {
      this._modal.visible = true;

      resolve();
    });
  }

  @Method()
  public async hide(): Promise<void> {
    return new Promise((resolve) => {
      this._modal.visible = false;

      resolve();
    });
  }

  componentWillLoad() {
    this._modal = new VRModal(1, this.parent, { 
        baseImagePath: getAssetPath('assets'),
        id: this.id,
        width: this.width, 
        height: this.height,
        offset: this.offset,
        padding: this.padding,
        backgroundColor: this.backgroundColor,
        borderColor: this.borderColor,
        borderRadius: this.borderRadius,
        borderWidth: this.borderWidth,
        closeButtonWidth: this.closeButtonWidth
    });
    
    let position = 1;

    this.el.childNodes.forEach(element => {
      element["parent"] = this._modal;
      element["position"] = position;
      element["depth"] = 2;

      position++;
    });

    this.addToRoot.emit(this._modal);
  } 

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
