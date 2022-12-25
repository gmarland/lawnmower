import { 
  Component, 
  Host, 
  h ,
  Prop,
  Element
} from '@stencil/core';

import { SceneElement } from '../../classes/components/SceneElement';
import { VRDivLayout } from '../../classes/components/vr-div/VRDivLayout';
import { ItemVerticalAlign } from '../../classes/geometry/ItemVerticalAlign';
import { VerticalAlign } from '../../classes/geometry/VerticalAlign';
import { HorizontalAlign } from '../../classes/geometry/HorizontalAlign';
import { ItemHorizontalAlign } from '../../classes/geometry/ItemHorizontalAlign';
import { ColumnVRDiv } from '../../classes/components/vr-div/ColumnVRDiv';
import { VRDiv } from '../../classes/components/vr-div/VRDiv';
import { RowVRDiv } from '../../classes/components/vr-div/RowVRDiv';

@Component({
  tag: 'vr-div',
  styleUrl: 'vr-div.scss',
  shadow: true,
})
export class VrPanel {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  @Prop() public position: number;

  @Prop() public depth: number;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop() public layout: string = "Row";

  @Prop() public verticalAlign: string = "Top";
  @Prop() public horizontalAlign: string = "Center";

  @Prop() public itemVerticalAlign: string = "Top";
  @Prop() public itemHorizontalAlign: string = "Center";

  @Prop() public width: number;

  @Prop() public height?: number;

  @Prop() public borderRadius: number = 0;

  @Prop() public color: string;

  @Prop() public opacity?: number;

  @Prop() public margin?: number;

  @Prop() public xRotation: number = 0;
  
  @Prop() public yRotation: number = 0;
  
  @Prop() public zRotation: number = 0;

  private _div: VRDiv;

  componentWillLoad() {
    const config = {
      verticalAlign: VerticalAlign[this.verticalAlign],
      horizontalAlign: HorizontalAlign[this.horizontalAlign],
      itemVerticalAlign: ItemVerticalAlign[this.itemVerticalAlign],
      itemHorizontalAlign: ItemHorizontalAlign[this.itemHorizontalAlign],
      height: this.height, 
      width: this.width, 
      color: this.color,
      margin: this.margin,
      borderRadius: this.borderRadius,
      opacity: this.opacity, 
      xRotation: this.xRotation,
      yRotation: this.yRotation,
      zRotation: this.zRotation
    };

    if (VRDivLayout[this.layout] == VRDivLayout.Column) {
      this._div = new ColumnVRDiv(this.depth, this.parent, config);
    }
    else {
      this._div = new RowVRDiv(this.depth, this.parent, config);
    }
    
    let position = 1;

    this.el.childNodes.forEach(element => {
      element["parent"] = this._div;
      element["position"] = position;
      element["depth"] = this.depth+1;

      position++;
    });
  }

  componentDidLoad() {
    this.parent.addChildElement(this.position, this._div);
  }

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
