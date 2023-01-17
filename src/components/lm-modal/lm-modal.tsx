import { 
  Component, 
  Host, 
  h,
  Prop,
  Element,
  Event,
  EventEmitter,
  getAssetPath,
  Method,
  Watch
} from '@stencil/core';

import { SceneElement } from '../../classes/components/SceneElement';
import { LMModal } from '../../classes/components/lm-modal/LMModal';

@Component({
  tag: 'lm-modal',
  styleUrl: 'lm-modal.scss',
  shadow: false
})
export class LmModal {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  @Prop() public vrEnabled: boolean = true;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop({ mutable: true }) public sceneElement: LMModal;

  @Prop({ reflect: true }) public id: string = "";

  @Prop() public borderRadius: number = 0;
  
  @Prop() public width: number = 1000;
  
  @Prop() public height?: number;
  
  @Prop() public offset: number = 50;
  
  @Prop() public padding: number = 10;

  @Prop() public borderColor: string =  "#ffffff";

  @Prop() public borderWidth: number = 0;

  @Prop() public backgroundColor: string = "#222222";

  @Prop() public closeButtonWidth: number = 50;

  @Event() public click: EventEmitter;

  @Event() public shown: EventEmitter;

  @Event() public hidden: EventEmitter;

  @Event() public addElementToRoot: EventEmitter<SceneElement>;

  @Watch('id')
  private updateId(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.id = newValue;
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

  @Watch('borderColor')
  private updateBorderColo(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.borderColor = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('borderWidth')
  private updateBorderWidth(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.borderWidth = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('backgroundColor')
  private updateBackgroundColor(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.backgroundColor = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('padding')
  private updatePadding(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.padding = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('closeButtonWidth')
  private updateCloseButtonWidth(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.closeButtonWidth = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Method()
  public async getUUID(): Promise<string> {
    return new Promise((resolve) => {
      resolve(this.sceneElement.uuid);
    });
  }

  @Method()
  public async show(): Promise<void> {
    return new Promise((resolve) => {
      this.sceneElement.visible = true;

      resolve();
    });
  }

  @Method()
  public async hide(): Promise<void> {
    return new Promise((resolve) => {
      this.sceneElement.visible = false;

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

  componentWillLoad() {
    this.sceneElement = new LMModal(1, this.parent, this.id, { 
        baseImagePath: getAssetPath('assets'),
        width: this.width, 
        height: this.height,
        offset: this.offset,
        padding: this.padding,
        backgroundColor: this.backgroundColor,
        borderColor: this.borderColor,
        borderRadius: this.borderRadius,
        borderWidth: this.borderWidth,
        closeButtonWidth: this.closeButtonWidth
    });

    this.sceneElement.modalShown = () => {
      this.shown.emit();
    }

    this.sceneElement.modalHidden = () => {
      this.hidden.emit();
    }
    
    let position = 1;

    this.el.childNodes.forEach(element => {
      if (!(element instanceof Text)) {
        element["parent"] = this.sceneElement;
        element["position"] = position;
        element["depth"] = 2;

        position++;
      }
    });

    this.addElementToRoot.emit(this.sceneElement);
  } 

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
