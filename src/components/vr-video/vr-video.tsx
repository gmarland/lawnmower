import { 
  Component, 
  Host, 
  h,
  Prop,
  Element,
  Event,
  EventEmitter,
  Watch
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

  @Prop() public play360: boolean = false;

  @Event() public onClick: EventEmitter;

  private _video: VRVideo;

  private _video360Element: HTMLVr360videoElement;

  @Watch('src')
  private updateSrc(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._video360Element) {
        await this._video360Element.close();

        this._video360Element.src = newValue;
      }

      if (this._video) {
        this._video.reset();
        this._video.src = newValue;
  
        const dimensionsUpdated = await this._video.draw();
        if (dimensionsUpdated) await this._video.drawParent();
      }

      resolve();
    });
  }

  @Watch('width')
  private updateWidth(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._video) {
        this._video.width = newValue;
  
        const dimensionsUpdated = await this._video.draw();
        if (dimensionsUpdated) await this._video.drawParent();
      }

      resolve();
    });
  }

  @Watch('height')
  private updateHeight(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._video) {
        this._video.height = newValue;
  
        const dimensionsUpdated = await this._video.draw();
        if (dimensionsUpdated) await this._video.drawParent();
      }

      resolve();
    });
  }

  @Watch('placeholder')
  private updatePlaceholder(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._video) {
        this._video.placeholderTimestamp = newValue;
  
        const dimensionsUpdated = await this._video.draw();
        if (dimensionsUpdated) await this._video.drawParent();
      }

      resolve();
    });
  }
  
  @Watch('play360')
  private updatePlay360(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._video360Element) await this._video360Element.close();

      if (this._video) {
        this._video.reset();
        this._video.playInline = !this.play360;
  
        const dimensionsUpdated = await this._video.draw();
        if (dimensionsUpdated) await this._video.drawParent();
      }

      resolve();
    });
  }

  @Watch('visible')
  private updateVisible(newValue: boolean): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._video) {
        this._video.visible = newValue;
  
        await this._video.drawParent();
      }

      resolve();
    });
  }

  componentWillLoad() {
    this._video = new VRVideo(this.depth, this.parent, this.src, { 
      width: this.width, 
      height: this.height,
      placeholderTimestamp: this.placeholder,
      playInline: !this.play360
    });

    this._video.onClick = () => {
      if (this.play360) this._video360Element.play();

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
        <vr-360video ref={(el) => this._video360Element = el as HTMLVr360videoElement}
                        src={ this.src }
                        parent={ this._video }></vr-360video>
      </Host>
    );
  }
}
