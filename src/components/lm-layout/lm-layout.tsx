import { 
  Component, 
  Host, 
  h,
  Element,
  Prop,
  Watch,
  Method
} from '@stencil/core';

import { Group } from 'three';

import { ISceneElement } from '../../classes/components/ISceneElement';

import { LMLayout } from '../../classes/components/lm-layout/LMLayout';
import { GeometryUtils } from '../../classes/geometry/GeometryUtils';

@Component({
  tag: 'lm-layout',
  styleUrl: 'lm-layout.scss',
  shadow: false
})
export class LmLayout {
  // *** Required for positioning ***

  @Prop() public parent: ISceneElement;

  @Prop() public sequenceNo: number;

  @Prop() public vrEnabled: boolean = true;

  @Prop() public shadowsEnabled: boolean = true;

  // *** Component specific
  
  @Element() el: HTMLElement

  @Prop() public position: string;

  @Prop({ mutable: true }) public sceneElement: LMLayout;

  @Prop({ reflect: true }) id: string = "index";

  @Watch('id')
  private updateId(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.id = newValue;
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
  public async destroy(): Promise<void> {
    return new Promise(async (resolve) => {
      this.el.remove();

      await this.sceneElement.destroy();
      
      resolve();
    });
  }

  componentWillLoad() {
    this.sceneElement = new LMLayout(this.parent, this.shadowsEnabled, GeometryUtils.parsePositionString(this.position), this.id);

    let sequenceNo = 1;

    this.el.childNodes.forEach(element => {
      if (!(element instanceof Text)) {
        element["parent"] = this.sceneElement;
        element["sequenceNo"] = sequenceNo;
        element["vrEnabled"] = this.vrEnabled;
        element["shadowsEnabled"] = this.shadowsEnabled;

        sequenceNo++;
      }
    });
  }

  componentDidLoad() {
    this.parent.addChildElement(this.sequenceNo, this.sceneElement);
  }

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
