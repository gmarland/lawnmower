import { 
  Component, 
  Host, 
  h, 
  Element,
  Prop,
  Listen,
  Method,
  Watch
} from '@stencil/core';
 
import { 
    Vector2
} from 'three';

import { VRButton } from '../../utils/VRButton.js';

import ResizeObserver from "resize-observer-polyfill";

import { MainScene } from '../../classes/scene/MainScene';

@Component({
  tag: 'lm-document',
  styleUrl: 'lm-document.scss',
  shadow: true
})
export class LmDocument {
  @Element() el: HTMLElement

  @Prop({ reflect: true }) public id: string = "";

  @Prop() startingDistance: number = 500;

  @Prop() public vrEnabled: boolean = true;

  @Prop() public controllerGuides: boolean = true;

  @Prop() title: string = "Lawnmower";

  @Prop() titlecardBackgroundImage?: string = null;

  @Prop() titlecardBackground?: string = "#222222";

  @Prop() titlecardFontFamily: string = "Arial";

  @Prop() titlecardFontColor: string = "#EEEFF3";

  @Prop() titlecardFontSize: string = "4em";

  private _sceneContainer: HTMLDivElement;

  private _vrLoadingContainer: HTMLDivElement;

  private _mainScene: MainScene;

  private _mousePoint: Vector2 = new Vector2();

  @Method()
  public async setLayout(layoutId: string): Promise<void> {
    return new Promise(async (resolve) => {
      await this._mainScene.setLayout(layoutId);

      resolve();
    });
  }

  @Method()
  public async showModal(id: string): Promise<void> {
    return new Promise((resolve) => {
      this._mainScene.showModalDialogByID(id);

      resolve();
    });
  }

  @Method()
  public async closeModal(): Promise<void> {
    return new Promise((resolve) => {
      this._mainScene.hideModalDialog();

      resolve();
    });
  }

  @Listen("addElementToRoot")
  private async addElementToRoot(e: CustomEvent): Promise<void> {
    return new Promise(async (resolve) => {
      await this._mainScene.addChildElement(0, e.detail);

      resolve();
    });
  }

  @Listen("updateRootElementPosition")
  private async updateRootElementPosition(e: CustomEvent): Promise<void> {
    return new Promise(async (resolve) => {
      await this._mainScene.updateRootElementPosition(e.detail);

      resolve();
    });
  }

  @Listen("removeFromRoot")
  private async removeFromRoot(e: CustomEvent): Promise<void> {
    return new Promise(async (resolve) => {
      await this._mainScene.attachToScene(e.detail);

      resolve();
    });
  }

  @Listen("hideCurrentLayout")
  private async hideCurrentLayout(): Promise<void> {
    return new Promise(async (resolve) => {
      this._mainScene.hideCurrentLayout();

      resolve();
    });
  }

  @Listen("showCurrentLayout")
  private async showCurrentLayout(): Promise<void> {
    return new Promise(async (resolve) => {
      this._mainScene.showCurrentLayout();

      resolve();
    });
  }

  @Listen("showModalDialog")
  private async showModalDialog(e: CustomEvent): Promise<void> {
    return new Promise(async (resolve) => {
      this._mainScene.showModalDialogByUUID(e.detail);

      resolve();
    });
  }

  @Watch('id')
  private updateId(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._mainScene) {
        this._mainScene.id = newValue;
      }

      resolve();
    });
  }

  private mouseMove(event: MouseEvent): void {
    this._mousePoint.set((event.clientX/this._sceneContainer.clientWidth)*2-1, -(event.clientY/this._sceneContainer.clientHeight )*2+1);
  }

  private mouseClick(): void {
    this._mainScene.onClick();
  }

  componentWillLoad() {
    this._mainScene = new MainScene(this._mousePoint);

    let sequenceNo = 1;

    this.el.childNodes.forEach(element => {
      if (!(element instanceof Text)) {
        element["parent"] = this._mainScene;
        element["sequenceNo"] = sequenceNo;
        element["vrEnabled"] = this.vrEnabled;

        sequenceNo++;
      }
    });
  }

  componentDidLoad() {
    this._mainScene.init(this.vrEnabled, this.controllerGuides, this._sceneContainer, this.startingDistance);
      
    let resizeObserver = new ResizeObserver(() => {
      this._mainScene.resize();
    });

    resizeObserver.observe(this._sceneContainer);

    if (this.vrEnabled) {
      this._vrLoadingContainer.appendChild(VRButton.createButton(this._mainScene.renderer.webGLRenderer, () => {
        this._vrLoadingContainer.style.display = "none";
      }));
    }
  }

  render() {
    return (
      <Host>
        <div ref={(el) => this._sceneContainer = el as HTMLDivElement } 
          class="scene-container"
          onMouseMove={(e: MouseEvent) => this.mouseMove(e)}
          onClick={() => this.mouseClick()}></div>
        <slot></slot>
        {
          this.vrEnabled
          ? <div ref={(el) => this._vrLoadingContainer = el as HTMLDivElement }
              class="vr-loading-container"
              style={{
                color: this.titlecardFontColor,
                fontSize: this.titlecardFontSize,
                fontFamily: this.titlecardFontFamily,
                background: this.titlecardBackground
              }}>
                {
                  this.titlecardBackgroundImage
                  ? <div id="title-card-image"><img src={ this.titlecardBackgroundImage } /></div>
                  : null
                }
                <div>{ this.title }</div>
            </div>
          : null
        }
      </Host>
    );
  }

}
