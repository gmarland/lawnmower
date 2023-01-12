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
import { LMVideo } from '../../classes/components/lm-video/LMVideo';

@Component({
  tag: 'lm-video',
  styleUrl: 'lm-video.scss',
  shadow: false
})
export class LmVideo {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  @Prop() public position: number;

  @Prop() public depth: number;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop({ mutable: true }) public sceneElement: LMVideo;

  @Prop({ reflect: true }) public id: string = "";

  @Prop() public src: string;

  @Prop() public width: number;

  @Prop() public height: number;

  @Prop() public placeholder: number = 0.1;

  @Prop() public play360: boolean = false;

  @Prop() public visible: boolean = true;

  @Event() public click: EventEmitter;

  private _dideo360Element: HTMLLm360videoElement;

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
      if (this._dideo360Element) {
        await this._dideo360Element.close();

        this._dideo360Element.src = newValue;
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
  
  @Watch('play360')
  private updatePlay360(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._dideo360Element) await this._dideo360Element.close();

      if (this.sceneElement) {
        this.sceneElement.reset();
        this.sceneElement.playInline = !this.play360;
  
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

  componentWillLoad() {
    this.sceneElement = new LMVideo(this.depth, this.parent, this.id, this.src, { 
      width: this.width, 
      height: this.height,
      placeholderTimestamp: this.placeholder,
      playInline: !this.play360
    });

    this.sceneElement.onClick = () => {
      if (this.play360) this._dideo360Element.play();

      this.click.emit();
    };
    
    let position = 1;

    this.el.childNodes.forEach(element => {
      if (!(element instanceof Text)) {
        element["parent"] = this.sceneElement;
        element["position"] = position;
        element["depth"] = this.depth+1;

        position++;
      }
    });
  }

  componentDidLoad() {
    this.parent.addChildElement(this.position, this.sceneElement);
  }

  render() {
    return (
      <Host>
        <lm-360video ref={(el) => this._dideo360Element = el as HTMLLm360videoElement}
                        src={ this.src }
                        parent={ this.sceneElement }></lm-360video>
      </Host>
    );
  }
}
