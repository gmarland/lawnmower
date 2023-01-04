import { 
  Component, 
  Host, 
  h,
  Prop,
  Element,
  Event,
  EventEmitter,
  Method
} from '@stencil/core';

import { SceneElement } from '../../classes/components/SceneElement';
import { VRAsset } from '../../classes/components/vr-asset/VRAsset';

@Component({
  tag: 'vr-asset',
  styleUrl: 'vr-asset.scss',
  shadow: true,
})
export class VrAsset {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  @Prop() public position: number;

  @Prop() public depth: number;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop() public src: string;

  @Prop() public activeAnimation: string;

  @Prop() public radius: number;

  @Prop() public xRotation: number = 0;
  
  @Prop() public yRotation: number = 0;
  
  @Prop() public zRotation: number = 0;

  @Prop() public xRotationSpeed: number = 0;
  
  @Prop() public yRotationSpeed: number = 0;
  
  @Prop() public zRotationSpeed: number = 0;

  @Event() public onClick: EventEmitter;

  private _asset: VRAsset;

  @Method()
  public async getAnimationNames(): Promise<Array<string>> {
    return new Promise((resolve) => resolve(this._asset.getAnimationNames()));
  }

  @Method()
  public async getActiveAnimationName(): Promise<string> {
    return new Promise((resolve) => resolve(this._asset.getActiveAnimationName()));
  }

  @Method()
  public async setActiveAnimation(animationName: string): Promise<void> {
    return new Promise((resolve) => {
      this._asset.setActiveAnimation(animationName);
      
      resolve();
    });
  }

  @Method()
  public async setRotation(x: number, y: number, z: number): Promise<void> {
    return new Promise((resolve) => {
      this._asset.setRotation(x, y, z);
      
      resolve();
    });
  }

  @Method()
  public async setXRotationSpeed(rotationSpeed: number): Promise<void> {
    return new Promise((resolve) => {
      this._asset.setXRotationSpeed(rotationSpeed);
      
      resolve();
    });
  }

  @Method()
  public async setYRotationSpeed(rotationSpeed: number): Promise<void> {
    return new Promise((resolve) => {
      this._asset.setYRotationSpeed(rotationSpeed);
      
      resolve();
    });
  }

  @Method()
  public async setZRotationSpeed(rotationSpeed: number): Promise<void> {
    return new Promise((resolve) => {
      this._asset.setZRotationSpeed(rotationSpeed);
      
      resolve();
    });
  }

  componentWillLoad() {
    this._asset = new VRAsset(this.parent, this.src, { 
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
      this.onClick.emit();
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
