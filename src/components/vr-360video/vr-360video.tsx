import { 
  Component, 
  Host, 
  h,
  Prop,
  Element,
  Event,
  EventEmitter,
  Method,
  Watch
} from '@stencil/core';

import { SceneElement } from '../../classes/components/SceneElement';
import { VR360Video } from '../../classes/components/vr-360video/VR360Video';

@Component({
  tag: 'vr-360video',
  styleUrl: 'vr-360video.scss',
  shadow: true,
})
export class Vr360Video {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  @Prop() public position: number;

  @Prop() public depth: number;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop() public src: string;

  @Prop() public videoRadius: number = 600;
  @Prop() public videoWidthSegments: number = 60;
  @Prop() public videoHieghtSegments: number = 40;

  @Event() public onClick: EventEmitter;

  @Event() public addToRoot: EventEmitter<SceneElement>;

  @Event() public hideCurrentLayout: EventEmitter;

  @Event() public showCurrentLayout: EventEmitter;

  @Event() public viewCurrentLayout: EventEmitter;

  private _controls: HTMLVrVideoControlsElement;

  private _video: VR360Video;

  @Method()
  public async play(): Promise<void> {
    return new Promise((resolve) => {
      this._video.play();

      this.hideCurrentLayout.emit();

      resolve();
    });
  }

  @Method()
  public async pause(): Promise<void> {
    return new Promise((resolve) => {
      this._video.pause();

      resolve();
    });
  }

  @Method()
  public async reset(): Promise<void> {
    return new Promise((resolve) => {
      this._video.reset();

      resolve();
    });
  }

  @Method() 
  public async close(): Promise<void> {
    return new Promise((resolve) => {
      this.hideVideo();

      resolve();
    });
  }

  @Watch('src')
  private updateSrc(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._video) {
        this.hideVideo();
        this._video.src = newValue;
  
        await this._video.draw();
      }

      resolve();
    });
  }

  private hideVideo(): void {
    this._video.reset();

    this._controls.hide();
    this._video.visible = false;
    
    this.showCurrentLayout.emit();
  }

  componentWillLoad() {
    this._video = new VR360Video(this.parent, this.src, { 
      videoRadius: this.videoRadius,
      videoWidthSegments: this.videoWidthSegments,
      videoHieghtSegments: this.videoHieghtSegments
    });

    this._video.onClick = () => {
      this._controls.getVisible().then((visible) => {
        if (visible) this._controls.hide();
        else this._controls.show(this._video.getIsPlaying());
      });

      this.onClick.emit();
    };
  }

  componentDidLoad() {
    this._controls.onPlay = () => {
      this._video.play();
    }

    this._controls.onPause = () => {
      this._video.pause();
    }

    this._controls.onClose = () => {
      this.hideVideo();
    }

    this.addToRoot.emit(this._video);
  }

  render() {
    return (
      <Host>
        <vr-video-controls ref={(el) => this._controls = el as HTMLVrVideoControlsElement} 
                            parent={this._video}></vr-video-controls>
      </Host>
    );
  }
}
