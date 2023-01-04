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
import { VRImage } from '../../classes/components/vr-image/VRImage';

@Component({
  tag: 'vr-image',
  styleUrl: 'vr-image.css',
  shadow: true,
})
export class VrImage {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  @Prop() public position: number;

  @Prop() public depth: number;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop() public src: string;

  @Prop() public width: number;

  @Prop() public height: number;

  @Prop() public borderRadius: number = 0;

  @Prop() public modal: boolean = false;

  @Event() public onClick: EventEmitter;

  @Event() public showModalDialog: EventEmitter<string>;

  private _image: VRImage;

  private _modalDialog: HTMLVrModalElement;

  componentWillLoad() {
    this._image = new VRImage(this.parent, this.src, { 
        width: this.width, 
        height: this.height,
        borderRadius: this.borderRadius
    });

    this._image.onClick =async  () => {
      if (this.modal && this._modalDialog) {
        this.showModalDialog.emit(await this._modalDialog.getUUID());
      }

      this.onClick.emit();
    };
    
    let position = 1;
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
          ? <vr-modal ref={(el) => this._modalDialog = el as HTMLVrModalElement } 
                      parent={this._image} 
                      border-radius="10">
              <vr-image src={ this.src }></vr-image>
            </vr-modal>
          : null 
        }
      </Host>
    );
  }
}
