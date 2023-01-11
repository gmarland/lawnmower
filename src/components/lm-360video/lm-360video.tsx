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
import { LM360Video } from '../../classes/components/lm-360video/LM360Video';

@Component({
  tag: 'lm-360video',
  styleUrl: 'lm-360video.scss',
  shadow: true,
})
export class Lm360Video {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  @Prop() public position: number;

  @Prop() public depth: number;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop() public src: string;

  @Prop() public videoRadius: number = 600;
  @Prop() public videoWidthSegments: number = 60;
  @Prop() public videoHeightSegments: number = 40;

  @Event() public click: EventEmitter;

  @Event() public addElementToRoot: EventEmitter<SceneElement>;

  @Event() public hideCurrentLayout: EventEmitter;

  @Event() public showCurrentLayout: EventEmitter;

  @Event() public viewCurrentLayout: EventEmitter;

  private _controls: HTMLLmVideoControlsElement;

  private _video: LM360Video;

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

  @Watch('videoRadius')
  private updateVideoRadius(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._video) {
        this.hideVideo();

        this._video.width = newValue;
  
        await this._video.draw();
      }

      resolve();
    });
  }

  @Watch('videoWidthSegments')
  private updateWidthSegments(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._video) {
        this.hideVideo();

        this._video.widthSegments = newValue;
  
        await this._video.draw();
      }

      resolve();
    });
  }

  @Watch('videoHeightSegments')
  private updateHeightSegments(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._video) {
        this.hideVideo();

        this._video.heightSegments = newValue;
  
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
    this._video = new LM360Video(this.parent, this.src, { 
      videoRadius: this.videoRadius,
      videoWidthSegments: this.videoWidthSegments,
      videoHeightSegments: this.videoHeightSegments
    });

    this._video.onClick = () => {
      this._controls.getVisible().then((visible) => {
        if (visible) this._controls.hide();
        else this._controls.show(this._video.getIsPlaying());
      });

      this.click.emit();
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

    this.addElementToRoot.emit(this._video);
  }

  render() {
    return (
      <Host>
        <lm-video-controls ref={(el) => this._controls = el as HTMLLmVideoControlsElement} 
                            parent={this._video}></lm-video-controls>
      </Host>
    );
  }
}
