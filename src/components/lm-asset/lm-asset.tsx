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

import { Group } from 'three';

import { ISceneElement } from '../../classes/components/ISceneElement';

import { LMAsset } from '../../classes/components/lm-asset/LMAsset';
import { GeometryUtils } from '../../classes/geometry/GeometryUtils';

@Component({
  tag: 'lm-asset',
  styleUrl: 'lm-asset.scss',
  shadow: false
})
export class LmAsset {
  // *** Required for positioning ***

  @Prop() public parent: ISceneElement;

  @Prop() public sequenceNo: number;

  @Prop() public vrEnabled: boolean = true;

  @Prop() public shadowsEnabled: boolean = true;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop() public position: string;

  @Prop() public offset: number;

  @Prop({ mutable: true }) public sceneElement: LMAsset;

  @Prop({ reflect: true }) public id: string = "";

  @Prop() public src: string;

  @Prop() public activeAnimation: string;

  @Prop() public radius: number;

  @Prop() public xRotation: number = 0;
  
  @Prop() public yRotation: number = 0;
  
  @Prop() public zRotation: number = 0;

  @Prop() public xRotationSpeed: number = 0;
  
  @Prop() public yRotationSpeed: number = 0;
  
  @Prop() public zRotationSpeed: number = 0;

  @Prop() public visible: boolean = true;

  @Event() public click: EventEmitter;

  @Watch('id')
  private updateId(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.id = newValue;
      }

      resolve();
    });
  }

  @Watch('radius')
  public async setRadius(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      this.sceneElement.width = newValue;
  
      const dimensionsUpdated = await this.sceneElement.draw();
      if (dimensionsUpdated) await this.sceneElement.drawParent();
      
      resolve();
    });
  }

  @Watch('src')
  private updateSrc(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.src = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('activeAnimation')
  public async updateActiveAnimation(newValue: string): Promise<void> {
    return new Promise((resolve) => {
      this.sceneElement.activeAnimation = newValue;
      
      resolve();
    });
  }

  @Watch('xRotation')
  public async setXRotation(newValue: number): Promise<void> {
    return new Promise((resolve) => {
      this.sceneElement.xRotation = newValue;
      
      resolve();
    });
  }

  @Watch('yRotation')
  public async setYRotation(newValue: number): Promise<void> {
    return new Promise((resolve) => {
      this.sceneElement.yRotation = newValue;
      
      resolve();
    });
  }

  @Watch('zRotation')
  public async setZRotation(newValue: number): Promise<void> {
    return new Promise((resolve) => {
      this.sceneElement.zRotation = newValue;
      
      resolve();
    });
  }

  @Watch('xRotationSpeed')
  public async setXRotationSpeed(newValue: number): Promise<void> {
    return new Promise((resolve) => {
      this.sceneElement.xRotationSpeed = newValue;
      
      resolve();
    });
  }

  @Watch('yRotationSpeed')
  public async setYRotationSpeed(newValue: number): Promise<void> {
    return new Promise((resolve) => {
      this.sceneElement.yRotationSpeed = newValue;
      
      resolve();
    });
  }

  @Watch('zRotationSpeed')
  public async setZRotationSpeed(newValue: number): Promise<void> {
    return new Promise((resolve) => {
      this.sceneElement.zRotationSpeed = newValue;
      
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
  public async getSceneObject(): Promise<Group> {
    return new Promise(async (resolve) => {
      resolve(await this.sceneElement.getContent());
    });
  }

  @Method()
  public async getAnimationNames(): Promise<Array<string>> {
    return new Promise((resolve) => resolve(this.sceneElement.animationNames));
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
    this.sceneElement = new LMAsset(this.parent, GeometryUtils.parsePositionString(this.position), this.id, this.src, { 
      shadowsEnabled: this.shadowsEnabled,
      offset: this.offset,
      activeAnimation: this.activeAnimation,
      radius: this.radius, 
      xRotation: this.xRotation,
      yRotation: this.yRotation,
      zRotation: this.zRotation, 
      xRotationSpeed: this.xRotationSpeed,
      yRotationSpeed: this.yRotationSpeed,
      zRotationSpeed: this.zRotationSpeed
    });

    this.sceneElement.onClick = () => {
      this.click.emit();
    };
  }

  componentDidLoad() {
    this.parent.addChildElement(this.sequenceNo, this.sceneElement);
  }

  render() {
    return (
      <Host />
    );
  }

}
