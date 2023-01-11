import { 
  Component, 
  Host, 
  h,
  Prop,
  Element,
  Event,
  EventEmitter,
  getAssetPath,
  Method,
  Watch
} from '@stencil/core';

import { SceneElement } from '../../classes/components/SceneElement';
import { LMModal } from '../../classes/components/lm-modal/LMModal';

@Component({
  tag: 'lm-modal',
  styleUrl: 'lm-modal.scss',
  shadow: true,
})
export class LmModal {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop() public id: string = "";

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

  @Event() public addElementToRoot: EventEmitter<SceneElement>;

  private _modal: LMModal;

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

  @Watch('borderRadius')
  private updateBorderRadius(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._modal) {
        this._modal.borderRadius = newValue;
  
        const dimensionsUpdated = await this._modal.draw();
        if (dimensionsUpdated) await this._modal.drawParent();
      }

      resolve();
    });
  }

  @Watch('borderColor')
  private updateBorderColo(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._modal) {
        this._modal.borderColor = newValue;
  
        const dimensionsUpdated = await this._modal.draw();
        if (dimensionsUpdated) await this._modal.drawParent();
      }

      resolve();
    });
  }

  @Watch('borderWidth')
  private updateBorderWidth(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._modal) {
        this._modal.borderWidth = newValue;
  
        const dimensionsUpdated = await this._modal.draw();
        if (dimensionsUpdated) await this._modal.drawParent();
      }

      resolve();
    });
  }

  @Watch('backgroundColor')
  private updateBackgroundColor(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._modal) {
        this._modal.backgroundColor = newValue;
  
        const dimensionsUpdated = await this._modal.draw();
        if (dimensionsUpdated) await this._modal.drawParent();
      }

      resolve();
    });
  }

  @Watch('padding')
  private updatePadding(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._modal) {
        this._modal.padding = newValue;
  
        const dimensionsUpdated = await this._modal.draw();
        if (dimensionsUpdated) await this._modal.drawParent();
      }

      resolve();
    });
  }

  @Watch('closeButtonWidth')
  private updateCloseButtonWidth(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._modal) {
        this._modal.closeButtonWidth = newValue;
  
        const dimensionsUpdated = await this._modal.draw();
        if (dimensionsUpdated) await this._modal.drawParent();
      }

      resolve();
    });
  }

  componentWillLoad() {
    this._modal = new LMModal(1, this.parent, { 
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

    this.addElementToRoot.emit(this._modal);
  } 

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
