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
  shadow: false
})
export class Lm360Video {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  @Prop() public position: number;

  @Prop() public depth: number;

  @Prop() public vrEnabled: boolean = true;

  // *** Component specific

  @Element() el: HTMLElement;

  @Prop({ mutable: true }) public sceneElement: LM360Video;

  @Prop({ reflect: true }) public id: string = "";

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
        this.hideVideo();

        this.sceneElement.src = newValue;
  
        await this.sceneElement.draw();
      }

      resolve();
    });
  }

  @Watch('videoRadius')
  private updateVideoRadius(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.hideVideo();

        this.sceneElement.width = newValue;
  
        await this.sceneElement.draw();
      }

      resolve();
    });
  }

  @Watch('videoWidthSegments')
  private updateWidthSegments(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.hideVideo();

        this.sceneElement.widthSegments = newValue;
  
        await this.sceneElement.draw();
      }

      resolve();
    });
  }

  @Watch('videoHeightSegments')
  private updateHeightSegments(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.hideVideo();

        this.sceneElement.heightSegments = newValue;
  
        await this.sceneElement.draw();
      }

      resolve();
    });
  }

  @Method()
  public async play(): Promise<void> {
    return new Promise((resolve) => {
      this.sceneElement.play();

      this.hideCurrentLayout.emit();

      resolve();
    });
  }

  @Method()
  public async pause(): Promise<void> {
    return new Promise((resolve) => {
      this.sceneElement.pause();

      resolve();
    });
  }

  @Method()
  public async reset(): Promise<void> {
    return new Promise((resolve) => {
      this.sceneElement.reset();

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

  @Method()
  public async destroy(): Promise<void> {
    return new Promise(async (resolve) => {
      this.el.remove();

      await this.sceneElement.destroy();
      
      resolve();
    });
  }

  private hideVideo(): void {
    this.sceneElement.reset();

    this._controls.hide();
    this.sceneElement.visible = false;
    
    this.showCurrentLayout.emit();
  }

  componentWillLoad() {
    this.sceneElement = new LM360Video(this.parent, this.id, this.src, { 
      vrEnabled: this.vrEnabled,
      videoRadius: this.videoRadius,
      videoWidthSegments: this.videoWidthSegments,
      videoHeightSegments: this.videoHeightSegments
    });

    this.sceneElement.onClick = () => {
      this._controls.getVisible().then((visible) => {
        if (visible) this._controls.hide();
        else this._controls.show(this.sceneElement.getIsPlaying());
      });

      this.click.emit();
    };
  }

  componentDidLoad() {
    this._controls.onPlay = () => {
      this.sceneElement.play();
    }

    this._controls.onPause = () => {
      this.sceneElement.pause();
    }

    this._controls.onClose = () => {
      this.hideVideo();
    }

    this.addElementToRoot.emit(this.sceneElement);
  }

  render() {
    return (
      <Host>
        <lm-video-controls ref={(el) => this._controls = el as HTMLLmVideoControlsElement} 
                            parent={this.sceneElement}></lm-video-controls>
      </Host>
    );
  }
}
