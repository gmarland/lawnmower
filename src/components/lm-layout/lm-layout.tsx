import { 
  Component, 
  Host, 
  h,
  Element,
  Prop,
  Watch,
  Method
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
  public async destroy(): Promise<void> {
    return new Promise(async (resolve) => {
      this.el.remove();

      await this.sceneElement.destroy();
      
      resolve();
    });
  }

  componentWillLoad() {
    this.sceneElement = new LMLayout(this.parent, this.id);

    let position = 1;

    this.el.childNodes.forEach(element => {
      if (!(element instanceof Text)) {
        element["parent"] = this.sceneElement;
        element["depth"] = this.depth;
        element["position"] = position;

        position++;
      }
    });
  }

  componentDidLoad() {
    this.parent.addChildElement(this.position, this.sceneElement);
  }

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
