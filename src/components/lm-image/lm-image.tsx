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
import { LMImage } from '../../classes/components/lm-image/LMImage';

@Component({
  tag: 'lm-image',
  styleUrl: 'lm-image.css',
  shadow: true,
})
export class LmImage {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  @Prop() public position: number;

  @Prop() public depth: number;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop() public id: string = "";

  @Prop() public src: string;

  @Prop() public width: number;

  @Prop() public height: number;

  @Prop() public borderRadius: number = 0;

  @Prop() public visible: boolean = true;

  @Prop() public modal: boolean = false;

  @Event() public click: EventEmitter;

  @Event() public showModalDialog: EventEmitter<string>;

  private _image: LMImage;

  private _modalDialog: HTMLLmModalElement;

  @Watch('id')
  private updateId(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._image) {
        this._image.id = newValue;
      }

      resolve();
    });
  }

  @Watch('src')
  private updateSrc(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._image) {
        this._image.src = newValue;
  
        const dimensionsUpdated = await this._image.draw();
        if (dimensionsUpdated) await this._image.drawParent();
      }

      resolve();
    });
  }

  @Watch('width')
  private updateWidth(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._image) {
        this._image.width = newValue;
  
        const dimensionsUpdated = await this._image.draw();
        if (dimensionsUpdated) await this._image.drawParent();
      }

      resolve();
    });
  }

  @Watch('height')
  private updateHeight(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._image) {
        this._image.height = newValue;
  
        const dimensionsUpdated = await this._image.draw();
        if (dimensionsUpdated) await this._image.drawParent();
      }

      resolve();
    });
  }

  @Watch('borderRadius')
  private updateBorderRadius(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._image) {
        this._image.borderRadius = newValue;
  
        const dimensionsUpdated = await this._image.draw();
        if (dimensionsUpdated) await this._image.drawParent();
      }

      resolve();
    });
  }

  @Watch('visible')
  private updateVisible(newValue: boolean): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._image) {
        this._image.visible = newValue;
  
        await this._image.drawParent();
      }

      resolve();
    });
  }

  componentWillLoad() {
    this._image = new LMImage(this.parent, this.id, this.src, { 
        width: this.width, 
        height: this.height,
        borderRadius: this.borderRadius
    });

    this._image.onClick =async  () => {
      if (this.modal && this._modalDialog) {
        this.showModalDialog.emit(await this._modalDialog.getUUID());
      }

      this.click.emit();
    };
  }

  componentDidLoad() {
    if (this._modalDialog) this._modalDialog.parent = this._image;

    this.parent.addChildElement(this.position, this._image);
  }
  
  render() {
    return (
      <Host>
        {
          this.modal 
          ? <lm-modal ref={(el) => this._modalDialog = el as HTMLLmModalElement } 
                      parent={this._image} 
                      border-radius="10">
              <lm-image src={ this.src }></lm-image>
            </lm-modal>
          : null 
        }
      </Host>
    );
  }
}
