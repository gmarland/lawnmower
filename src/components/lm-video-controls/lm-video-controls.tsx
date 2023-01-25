import { 
  Component, 
  Host, 
  h,
  Prop,
  Event,
  EventEmitter,
  getAssetPath,
  Watch
} from '@stencil/core';

import { Group } from 'three';

import { Method } from '@stencil/sass/dist/declarations';

import { ISceneElement } from '../../classes/components/ISceneElement';
import { LMVideoControls } from '../../classes/components/lm-video-controls/LMVideoControls';
import { GeometryUtils } from '../../classes/geometry/GeometryUtils';

@Component({
  tag: 'lm-video-controls',
  styleUrl: 'lm-video-controls.scss',
  shadow: false
})
export class LmVideoControls {
  // *** Required for positioning ***

  @Prop() public parent: ISceneElement;

  @Prop() public sequenceNo: number;

  @Prop() public vrEnabled: boolean = true;

  @Prop() public shadowsEnabled: boolean = true;

  // *** Component specific

  @Prop() public position: string;

  @Prop({ reflect: true }) public id: string = "";

  @Prop() public backgroundColor: string = "#333333";
    
  @Prop() public width: number = 75;
  
  @Prop() public height: number = 30;

  @Prop() public x: number = 0;
    
  @Prop() public y: number = 10;
  
  @Prop() public z: number = 300;

  @Prop() public onPlay: Function;

  @Prop() public onPause: Function;

  @Prop() public onClose: Function;

  // *** Component specific

  @Event() public addElementToRoot: EventEmitter<ISceneElement>;

  @Event() public updateRootElementPosition: EventEmitter<ISceneElement>;

  private _videoControls: LMVideoControls;

  @Watch('id')
  private updateId(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._videoControls) {
        this._videoControls.id = newValue;
      }

      resolve();
    });
  }

  @Watch('backgroundColor')
  private updateBackgroundColor(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._videoControls) {
        this._videoControls.backgroundColor = newValue;
  
        await this._videoControls.draw();
      }

      resolve();
    });
  }

  @Watch('width')
  private updateWidth(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._videoControls) {
        this._videoControls.width = newValue;
  
        const dimensionsUpdated = await this._videoControls.draw();
        if (dimensionsUpdated) await this._videoControls.drawParent();
      }

      resolve();
    });
  }

  @Watch('height')
  private updateHeight(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._videoControls) {
        this._videoControls.height = newValue;
  
        const dimensionsUpdated = await this._videoControls.draw();
        if (dimensionsUpdated) await this._videoControls.drawParent();
      }

      resolve();
    });
  }

  @Watch('x')
  private updateX(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._videoControls) {
        this._videoControls.x = newValue;

        this.updateRootElementPosition.emit(this._videoControls);
      }

      resolve();
    });
  }

  @Watch('y')
  private updateY(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._videoControls) {
        this._videoControls.y = newValue;

        this.updateRootElementPosition.emit(this._videoControls);
      }

      resolve();
    });
  }

  @Watch('z')
  private updateZ(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._videoControls) {
        this._videoControls.z = newValue;

        this.updateRootElementPosition.emit(this._videoControls);
      }

      resolve();
    });
  }

  @Method()
  public async getSceneObject(): Promise<Group> {
    return new Promise(async (resolve) => {
      resolve(await this._videoControls.getContent());
    });
  }

  @Method()
  public async getVisible(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this._videoControls) resolve(this._videoControls.visible);
      else resolve(false);
    });
  }

  @Method()
  public async show(isPlaying: boolean): Promise<void> {
    return new Promise((resolve) => {
      if (this._videoControls) this._videoControls.show(isPlaying);

      resolve();
    });
  }

  @Method()
  public async hide(): Promise<void> {
    return new Promise((resolve) => {
      if (this._videoControls) this._videoControls.visible = false;

      resolve();
    });
  }

  componentWillLoad() {
    this._videoControls = new LMVideoControls(this.parent, GeometryUtils.parsePositionString(this.position), this.id, {
      shadowsEnabled: this.shadowsEnabled,
      offset: 0,
      vrEnabled: this.vrEnabled,
      baseImagePath: getAssetPath('assets'),
      backgroundColor: this.backgroundColor,
      width: this.width,
      height: this.height,
      x: this.x,
      y: this.y,
      z: this.z
    });

    this._videoControls.onPlay = () => {
      if (this.onPlay) this.onPlay()
    }

    this._videoControls.onPause = () => {
      if (this.onPause) this.onPause()
    }

    this._videoControls.onClose = () => {
      if (this.onClose) this.onClose()
    }
  }

  componentDidLoad() {
    this.addElementToRoot.emit(this._videoControls);
  }

  render() {
    return (
      <Host />
    );
  }

}
