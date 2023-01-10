import { 
  Component, 
  Host, 
  h,
  Element,
  Prop
} from '@stencil/core';
import { SceneElement } from '../../classes/components/SceneElement';

import { LMLayout } from '../../classes/components/lm-layout/LMLayout';

@Component({
  tag: 'lm-layout',
  styleUrl: 'lm-layout.scss',
  shadow: true,
})
export class LmLayout {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  @Prop() public position: number;

  @Prop() public depth: number;

  // *** Component specific
  
  @Element() el: HTMLElement

  @Prop() id: string = "index";

  private _layout: LMLayout;

  componentWillLoad() {
    this._layout = new LMLayout(this.parent, this.id);

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