import { 
  Component, 
  Host, 
  h,
  Element,
  Prop,
  Watch
} from '@stencil/core';
import { SceneElement } from '../../classes/components/SceneElement';

import { LMLayout } from '../../classes/components/lm-layout/LMLayout';

@Component({
  tag: 'lm-layout',
  styleUrl: 'lm-layout.scss',
  shadow: false
})
export class LmLayout {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  @Prop() public position: number;

  @Prop() public depth: number;

  // *** Component specific
  
  @Element() el: HTMLElement

  @Prop({ reflect: true }) id: string = "index";

  private _layout: LMLayout;

  @Watch('id')
  private updateId(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._layout) {
        this._layout.id = newValue;
      }

      resolve();
    });
  }

  componentWillLoad() {
    this._layout = new LMLayout(this.parent, this.id);

    let position = 1;

    this.el.childNodes.forEach(element => {
      if (!(element instanceof Text)) {
        element["parent"] = this._layout;
        element["depth"] = this.depth;
        element["position"] = position;

        position++;
      }
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
