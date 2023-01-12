import { 
  Component, 
  Host, 
  h ,
  Prop,
  Element,
  Watch
} from '@stencil/core';

import { SceneElement } from '../../classes/components/SceneElement';
import { LMDivLayout } from '../../classes/components/lm-div/LMDivLayout';
import { ItemVerticalAlign } from '../../classes/geometry/ItemVerticalAlign';
import { VerticalAlign } from '../../classes/geometry/VerticalAlign';
import { HorizontalAlign } from '../../classes/geometry/HorizontalAlign';
import { ItemHorizontalAlign } from '../../classes/geometry/ItemHorizontalAlign';
import { ColumnLMDiv } from '../../classes/components/lm-div/ColumnLMDiv';
import { LMDiv } from '../../classes/components/lm-div/LMDiv';
import { RowVRDiv } from '../../classes/components/lm-div/RowLMDiv';
import { Method } from '@stencil/core/internal';

@Component({
  tag: 'lm-div',
  styleUrl: 'lm-div.scss',
  shadow: true,
})
export class LmDiv {
  // *** Required for positioning ***

  @Prop() public parent: SceneElement;

  @Prop() public position: number;

  @Prop() public depth: number;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop() public id: string = "";

  @Prop() public layout: string = "Row";

  @Prop() public verticalAlign: string = "Top";
  @Prop() public horizontalAlign: string = "Center";

  @Prop() public itemVerticalAlign: string = "Top";
  @Prop() public itemHorizontalAlign: string = "Center";

  @Prop() public width: number;

  @Prop() public height?: number;

  @Prop() public borderRadius: number = 0;

  @Prop() public backgroundColor: string;

  @Prop() public opacity?: number;

  @Prop() public margin?: number;

  @Prop() public padding?: number;

  @Prop() public xRotation: number = 0;
  
  @Prop() public yRotation: number = 0;
  
  @Prop() public zRotation: number = 0;

  private _div: LMDiv;

  private _slot: HTMLSlotElement;

  @Watch('id')
  private updateId(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._div) {
        this._div.id = newValue;
      }

      resolve();
    });
  }

  @Watch('width')
  private updateWidth(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._div) {
        this._div.width = newValue;
  
        const dimensionsUpdated = await this._div.draw();
        if (dimensionsUpdated) await this._div.drawParent();
      }

      resolve();
    });
  }

  @Watch('height')
  private updateheight(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._div) {
        this._div.height = newValue;
  
        const dimensionsUpdated = await this._div.draw();
        if (dimensionsUpdated) await this._div.drawParent();
      }

      resolve();
    });
  }

  @Watch('backgroundColor')
  private updateBackgroundColor(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._div) {
        this._div.backgroundColor = newValue;
      }

      resolve();
    });
  }

  @Watch('borderRadius')
  private updateBorderRadius(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._div) {
        this._div.borderRadius = newValue;
  
        const dimensionsUpdated = await this._div.draw();
        if (dimensionsUpdated) await this._div.drawParent();
      }

      resolve();
    });
  }

  @Watch('padding')
  private updatePadding(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._div) {
        this._div.padding = newValue;
  
        const dimensionsUpdated = await this._div.draw();
        if (dimensionsUpdated) await this._div.drawParent();
      }

      resolve();
    });
  }
  
  @Watch('verticalAlign')
  public updateVerticalAlign(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._div) {
        this._div.verticalAlign = VerticalAlign[newValue];
  
        const dimensionsUpdated = await this._div.draw();
        if (dimensionsUpdated) await this._div.drawParent();
      }

      resolve();
    });
  }

  @Watch('horizontalAlign')
  public updateHorizontalAlign(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._div) {
        this._div.horizontalAlign = HorizontalAlign[newValue];
  
        const dimensionsUpdated = await this._div.draw();
        if (dimensionsUpdated) await this._div.drawParent();
      }

      resolve();
    });
  }

  @Watch('itemHorizontalAlign')
  public updateItemHorizontalAlign(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._div) {
        this._div.itemHorizontalAlign = ItemHorizontalAlign[newValue];
  
        const dimensionsUpdated = await this._div.draw();
        if (dimensionsUpdated) await this._div.drawParent();
      }

      resolve();
    });
  }

  @Watch('itemVerticalAlign')
  public updateItemVerticalAlign(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this._div) {
        this._div.itemVerticalAlign = ItemVerticalAlign[newValue];
    
        const dimensionsUpdated = await this._div.draw();
        if (dimensionsUpdated) await this._div.drawParent();
      }

      resolve();
    });
  }

  @Method()
  public async append(element: HTMLLmTextElement): Promise<void> {
    element["parent"] = this._div;
    element["position"] = this._div.getChildSceneElements().length;
    element["depth"] = this.depth+1;
    
    this.el.appendChild(element);
  }

  @Method()
  public async prepend(element: HTMLLmTextElement): Promise<void> {
    element["parent"] = this._div;
    element["position"] = 0;
    element["depth"] = this.depth+1;
    
    this.el.prepend(element);
  }

  componentWillLoad() {
    const config = {
      verticalAlign: VerticalAlign[this.verticalAlign],
      horizontalAlign: HorizontalAlign[this.horizontalAlign],
      itemVerticalAlign: ItemVerticalAlign[this.itemVerticalAlign],
      itemHorizontalAlign: ItemHorizontalAlign[this.itemHorizontalAlign],
      height: this.height, 
      width: this.width, 
      backgroundColor: this.backgroundColor,
      padding: this.padding,
      margin: this.margin,
      borderRadius: this.borderRadius,
      opacity: this.opacity, 
      xRotation: this.xRotation,
      yRotation: this.yRotation,
      zRotation: this.zRotation
    };

    if (LMDivLayout[this.layout] == LMDivLayout.Column) this._div = new ColumnLMDiv(this.depth, this.parent, this.id, config);
    else this._div = new RowVRDiv(this.depth, this.parent, this.id, config);
    
    let position = 0;

    this.el.childNodes.forEach(element => {
      if (!(element instanceof Text)) {
        element["parent"] = this._div;
        element["position"] = position;
        element["depth"] = this.depth+1;

        position++;
      }
    });
  }

  componentDidLoad() {
    this.parent.addChildElement(this.position, this._div);
  }

  render() {
    return (
      <Host>
        <slot ref={(el) => this._slot = el as HTMLSlotElement } ></slot>
      </Host>
    );
  }

}
