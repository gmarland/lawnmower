import { 
  Component, 
  Host, 
  h, 
  Element, 
  Prop, 
  Event, 
  EventEmitter,
  Watch,
  Method
} from '@stencil/core';

import { Group } from 'three';

import { ISceneElement } from '../../classes/components/ISceneElement';
import { LMHTML } from '../../classes/components/lm-html/LMHTML';
import { GeometryUtils } from '../../classes/geometry/GeometryUtils';

@Component({
  tag: 'lm-html',
  styleUrl: 'lm-html.scss',
  shadow: false
})
export class LmImage {
  // *** Required for positioning ***

  @Prop() public parent: ISceneElement;

  @Prop() public sequenceNo: number;

  @Prop() public vrEnabled: boolean = true;

  @Prop() public shadowsEnabled: boolean = true;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop() public offset: number;

  @Prop() public position: string;

  @Prop({ mutable: true }) public sceneElement: LMHTML;

  @Prop({ reflect: true }) public id: string = "";

  @Prop() public src: string;

  @Prop() public width: number;

  @Prop() public height: number;

  @Prop() public borderRadius: number = 0;

  @Prop() public visible: boolean = true;

  @Prop() public modal: boolean = false;

  @Event() public click: EventEmitter;

  @Event() public showModalDialog: EventEmitter<string>;

  private _modalDialog: HTMLLmModalElement;

  @Watch('id')
  private updateId(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.id = newValue;
      }

      resolve();
    });
  }

  @Watch('src')
  private updateSrc(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.src = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
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
  public async getSceneObject(): Promise<Group> {
    return new Promise(async (resolve) => {
      resolve(await this.sceneElement.getContent());
    });
  }

  @Method()
  public async destroy(): Promise<void> {
    return new Promise(async (resolve) => {
      this.el.remove();

      await this.sceneElement.destroy();

      if (this._modalDialog) this._modalDialog.destroy();
      
      resolve();
    });
  }

  componentWillLoad() {
    this.sceneElement = new LMHTML(this.parent, GeometryUtils.parsePositionString(this.position), this.id, this.src, { 
        shadowsEnabled: this.shadowsEnabled,
        width: this.width, 
        height: this.height,
        borderRadius: this.borderRadius,
        offset: this.offset
    });

    this.sceneElement.onClick =async  () => {
      if (this.modal && this._modalDialog) {
        this.showModalDialog.emit(await this._modalDialog.getUUID());
      }

      this.click.emit();
    };
  }

  componentDidLoad() {
    if (this._modalDialog) this._modalDialog.parent = this.sceneElement;

    this.parent.addChildElement(this.sequenceNo, this.sceneElement);
  }
  
  render() {
    return (
      <Host>
        {
          this.modal 
          ? <lm-modal ref={(el) => this._modalDialog = el as HTMLLmModalElement } 
                      parent={this.sceneElement} 
                      border-radius="10">
              <lm-image src={ this.src }></lm-image>
            </lm-modal>
          : null 
        }
      </Host>
    );
  }
}
