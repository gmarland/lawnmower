import { 
  Component, 
  Host, 
  h,
  Prop,
  Element,
  Event,
  EventEmitter
} from '@stencil/core';
import { SceneElement } from '../../classes/components/SceneElement';
import { VRVideo } from '../../classes/components/vr-video/VRVideo';

@Component({
  tag: 'vr-video',
  styleUrl: 'vr-video.scss',
  shadow: true,
})
export class VrVideo {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  @Prop() public position: number;

  @Prop() public depth: number;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop() public src: string;

  @Prop() public width: number = 100;

  @Prop() public height: number;

  @Prop() public placeholder: number = 0.1;

  @Prop() public play360: boolean = true;

  @Event() public onClick: EventEmitter;

  private _video: VRVideo;

  private _video360Element: HTMLVr360videoElement;

  componentWillLoad() {
    this._video = new VRVideo(this.depth, this.parent, this.src, { 
      width: this.width, 
      height: this.height,
      placeholderTimestamp: this.placeholder,
      playInline: !this.play360
    });

    this._video.onClick = () => {
      this._video360Element.play();

      this.onClick.emit();
    };
    
    let position = 1;

    this.el.childNodes.forEach(element => {
      element["parent"] = this._video;
      element["position"] = position;
      element["depth"] = this.depth+1;

      position++;
    });
  }

  componentDidLoad() {
    this.parent.addChildElement(this.position, this._video);
  }

  render() {
    return (
      <Host>
        {
          this.play360 
          ? <vr-360video ref={(el) => this._video360Element = el as HTMLVr360videoElement}
                          src={ this.src }></vr-360video>
          : null
        }
      </Host>
    );
  }
}
