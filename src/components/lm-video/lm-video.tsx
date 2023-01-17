import { 
  Component, 
  Host, 
  h,
  Prop,
  Element,
  Event,
  EventEmitter,
  Watch,
  Method
} from '@stencil/core';

import { SceneElement } from '../../classes/components/SceneElement';
import { LMVideo } from '../../classes/components/lm-video/LMVideo';
import { GeometryUtils } from '../../classes/geometry/GeometryUtils';

@Component({
  tag: 'lm-video',
  styleUrl: 'lm-video.scss',
  shadow: false
})
export class LmVideo {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  @Prop() public sequenceNo: number;

  @Prop() public vrEnabled: boolean = true;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop() public position: string;

  @Prop({ mutable: true }) public sceneElement: LMVideo;

  @Prop({ reflect: true }) public id: string = "";

  @Prop() public src: string;

  @Prop() public width: number;

  @Prop() public height: number;

  @Prop() public placeholder: number = 0.1;

  @Prop() public playback: string = "inline";

  @Prop() public visible: boolean = true;

  @Event() public click: EventEmitter;

  @Event() public showModalDialog: EventEmitter<string>;

  private _video360Element: HTMLLm360videoElement;
  private _videoInlineElement: HTMLLmVideoElement;

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
      if (this._video360Element) {
        await this._video360Element.close();

        this._video360Element.src = newValue;
      }

      if (this.sceneElement) {
        this.sceneElement.reset();
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

  @Watch('placeholder')
  private updatePlaceholder(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.placeholderTimestamp = newValue;
  
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
  public async play(): Promise<void> {
    return new Promise((resolve) => {
      this.sceneElement.play();

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
  public async destroy(): Promise<void> {
    return new Promise(async (resolve) => {
      this.el.remove();

      await this.sceneElement.destroy();

      if (this._modalDialog) this._modalDialog.destroy();
      
      resolve();
    });
  }

  componentWillLoad() {
    this.sceneElement = new LMVideo(this.parent, GeometryUtils.parsePositionString(this.position), this.id, this.src, { 
      vrEnabled: this.vrEnabled,
      width: this.width, 
      height: this.height,
      placeholderTimestamp: this.placeholder,
      playInline: (this.playback == "inline")
    });

    this.sceneElement.onClick = () => {
      if (this.playback == "360") {
        this._video360Element.play();
      }
      else if (this.playback == "modal") {
        if (this._modalDialog && this._modalDialog) {
          this._modalDialog.getUUID().then((uuid) => {
            this.showModalDialog.emit(uuid);
          });
        }
      }

      this.click.emit();
    };

    let sequenceNo = 1;

    this.el.childNodes.forEach(element => {
      if (!(element instanceof Text)) {
        element["parent"] = this.sceneElement;
        element["sequenceNo"] = sequenceNo;

        sequenceNo++;
      }
    });
  }

  componentDidLoad() {    
    if (this.playback == "modal") {
      this._modalDialog.addEventListener("shown", () => {
        this._videoInlineElement.play();
      });
      
      this._modalDialog.addEventListener("hidden", () => {
        this._videoInlineElement.reset();
      });
    }

    this.parent.addChildElement(this.sequenceNo, this.sceneElement);
  }

  render() {
    return (
      <Host>
        {
          (this.playback == "360")
          ? <lm-360video ref={(el) => this._video360Element = el as HTMLLm360videoElement}
                          vr-enabled={this.vrEnabled}
                          src={ this.src }
                          parent={ this.sceneElement }></lm-360video>
          : null
        }
        {
          (this.playback == "modal")
          ? <lm-modal ref={(el) => this._modalDialog = el as HTMLLmModalElement } 
                    parent={this.sceneElement} 
                    border-radius="10">
              <lm-video ref={(el) => this._videoInlineElement = el as HTMLLmVideoElement }  src={ this.src } ></lm-video>
            </lm-modal>
          : null
        }
      </Host>
    );
  }
}
