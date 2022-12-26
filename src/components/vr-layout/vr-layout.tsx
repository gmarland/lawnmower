import { 
  Component, 
  Host, 
  h,
  Element,
  Prop
} from '@stencil/core';
import { SceneElement } from '../../classes/components/SceneElement';

import { VRLayout } from '../../classes/components/vr-layout/VRLayout';

@Component({
  tag: 'vr-layout',
  styleUrl: 'vr-layout.scss',
  shadow: true,
})
export class VrLayout {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  @Prop() public position: number;

  @Prop() public depth: number;

  // *** Component specific
  
  @Element() el: HTMLElement

  @Prop() id: string = "index";

  private _layout: VRLayout;

  componentWillLoad() {
    this._layout = new VRLayout(this.parent, this.id);

    let position = 1;

    this.el.childNodes.forEach(element => {
      element["parent"] = this._layout;
      element["depth"] = this.depth;
      element["position"] = position;

      position++;
    });
  }

  componentDidLoad() {
    this.parent.addChildElement(this.position, this._layout);
  }

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
