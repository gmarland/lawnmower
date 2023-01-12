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
import { LMAsset } from '../../classes/components/lm-asset/LMAsset';

@Component({
  tag: 'lm-asset',
  styleUrl: 'lm-asset.scss',
  shadow: false
})
export class LmAsset {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  @Prop() public position: number;

  @Prop() public depth: number;

  // *** Component specific

  @Element() el: HTMLElement

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

  private _asset: LMAsset;

  @Watch('id')
  private updateId(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._asset) {
        this._asset.id = newValue;
      }

      resolve();
    });
  }

  @Watch('radius')
  public async setRadius(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      this._asset.width = newValue;
  
      const dimensionsUpdated = await this._asset.draw();
      if (dimensionsUpdated) await this._asset.drawParent();
      
      resolve();
    });
  }

  @Watch('src')
  private updateSrc(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._asset) {
        this._asset.src = newValue;
  
        const dimensionsUpdated = await this._asset.draw();
        if (dimensionsUpdated) await this._asset.drawParent();
      }

      resolve();
    });
  }

  @Watch('activeAnimation')
  public async updateActiveAnimation(newValue: string): Promise<void> {
    return new Promise((resolve) => {
      this._asset.activeAnimation = newValue;
      
      resolve();
    });
  }

  @Watch('xRotation')
  public async setXRotation(newValue: number): Promise<void> {
    return new Promise((resolve) => {
      this._asset.xRotation = newValue;
      
      resolve();
    });
  }

  @Watch('yRotation')
  public async setYRotation(newValue: number): Promise<void> {
    return new Promise((resolve) => {
      this._asset.yRotation = newValue;
      
      resolve();
    });
  }

  @Watch('zRotation')
  public async setZRotation(newValue: number): Promise<void> {
    return new Promise((resolve) => {
      this._asset.zRotation = newValue;
      
      resolve();
    });
  }

  @Watch('xRotationSpeed')
  public async setXRotationSpeed(newValue: number): Promise<void> {
    return new Promise((resolve) => {
      this._asset.xRotationSpeed = newValue;
      
      resolve();
    });
  }

  @Watch('yRotationSpeed')
  public async setYRotationSpeed(newValue: number): Promise<void> {
    return new Promise((resolve) => {
      this._asset.yRotationSpeed = newValue;
      
      resolve();
    });
  }

  @Watch('zRotationSpeed')
  public async setZRotationSpeed(newValue: number): Promise<void> {
    return new Promise((resolve) => {
      this._asset.zRotationSpeed = newValue;
      
      resolve();
    });
  }

  @Watch('visible')
  private updateVisible(newValue: boolean): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._asset) {
        this._asset.visible = newValue;
  
        await this._asset.drawParent();
      }

      resolve();
    });
  }

  @Method()
  public async getAnimationNames(): Promise<Array<string>> {
    return new Promise((resolve) => resolve(this._asset.getAnimationNames()));
  }

  componentWillLoad() {
    this._asset = new LMAsset(this.parent, this.id, this.src, { 
      activeAnimation: this.activeAnimation,
      radius: this.radius, 
      xRotation: this.xRotation,
      yRotation: this.yRotation,
      zRotation: this.zRotation, 
      xRotationSpeed: this.xRotationSpeed,
      yRotationSpeed: this.yRotationSpeed,
      zRotationSpeed: this.zRotationSpeed
    });

    this._asset.onClick = () => {
      this.click.emit();
    };
  }

  componentDidLoad() {
    this.parent.addChildElement(this.position, this._asset);
  }

  render() {
    return (
      <Host />
    );
  }

}
