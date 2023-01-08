import { 
  Component, 
  Host, 
  h, 
  Element,
  Prop,
  Listen,
  Method
} from '@stencil/core';

import { 
    Vector2
} from 'three';

import ResizeObserver from "resize-observer-polyfill";

import { MainScene } from '../../classes/scene/MainScene';

@Component({
  tag: 'vr-document',
  styleUrl: 'vr-document.scss',
  shadow: true,
})
export class VrDocument {
  @Element() el: HTMLElement

  @Prop() startingDistance: number = 500;

  private _sceneContainer: HTMLDivElement;

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

  @Listen("addToRoot")
  private async addToRoot(e: CustomEvent): Promise<void> {
    return new Promise(async (resolve) => {
      await this._mainScene.addChildElement(0, e.detail);

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

  private mouseMove(event: MouseEvent): void {
    this._mousePoint.set((event.clientX/this._sceneContainer.clientWidth)*2-1, -(event.clientY/this._sceneContainer.clientHeight )*2+1);
  }

  private mouseClick(): void {
    this._mainScene.onClick();
  }

  componentWillLoad() {
    this._mainScene = new MainScene(this._mousePoint);

    let position = 1;

    this.el.childNodes.forEach(element => {
      element["parent"] = this._mainScene;
      element["depth"] = 1;
      element["position"] = position;

      position++;
    });
  }

  componentDidLoad() {
    this._mainScene.init(this._sceneContainer, this.startingDistance);
      
    let resizeObserver = new ResizeObserver(() => {
      this._mainScene.resize();
    });

    resizeObserver.observe(this._sceneContainer);
  }

  render() {
    return (
      <Host>
        <div ref={(el) => this._sceneContainer = el as HTMLDivElement } 
              class="scene-container"
              onMouseMove={(e: MouseEvent) => this.mouseMove(e)}
              onClick={() => this.mouseClick()}></div>
        <slot></slot>
      </Host>
    );
  }

}
