import { 
  Component, 
  Host, 
  h ,
  Prop,
  Element,
  Watch
} from '@stencil/core';

import { Group } from 'three';

import { ISceneElement } from '../../classes/components/ISceneElement';
import { LMDivLayout } from '../../classes/components/lm-div/LMDivLayout';
import { ItemVerticalAlign } from '../../classes/geometry/ItemVerticalAlign';
import { VerticalAlign } from '../../classes/geometry/VerticalAlign';
import { HorizontalAlign } from '../../classes/geometry/HorizontalAlign';
import { ItemHorizontalAlign } from '../../classes/geometry/ItemHorizontalAlign';
import { ColumnLMDiv } from '../../classes/components/lm-div/ColumnLMDiv';
import { LMDiv } from '../../classes/components/lm-div/LMDiv';
import { RowVRDiv } from '../../classes/components/lm-div/RowLMDiv';
import { Method } from '@stencil/core/internal';
import { GeometryUtils } from '../../classes/geometry/GeometryUtils';

@Component({
  tag: 'lm-div',
  styleUrl: 'lm-div.scss',
  shadow: false
})
export class LmDiv {
  // *** Required for positioning ***

  @Prop() public parent: ISceneElement;

  @Prop() public sequenceNo: number;

  @Prop() public vrEnabled: boolean = true;

  @Prop() public shadowsEnabled: boolean = true;

  // *** Component specific

  @Element() el: HTMLElement

  @Prop() public position: string;

  @Prop() public offset: number;

  @Prop({ mutable: true }) public sceneElement: LMDiv;

  @Prop({ reflect: true }) public id: string = "";

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

  @Watch('id')
  private updateId(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.id = newValue;
      }

      resolve();
    });
  }

  @Watch('width')
  private updateWidth(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.width = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('height')
  private updateheight(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.height = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('backgroundColor')
  private updateBackgroundColor(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.backgroundColor = newValue;
      }

      resolve();
    });
  }

  @Watch('borderRadius')
  private updateBorderRadius(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.borderRadius = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('padding')
  private updatePadding(newValue: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.padding = newValue;
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }
  
  @Watch('verticalAlign')
  public updateVerticalAlign(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.verticalAlign = VerticalAlign[newValue];
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('horizontalAlign')
  public updateHorizontalAlign(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.horizontalAlign = HorizontalAlign[newValue];
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('itemHorizontalAlign')
  public updateItemHorizontalAlign(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.itemHorizontalAlign = ItemHorizontalAlign[newValue];
  
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
      }

      resolve();
    });
  }

  @Watch('itemVerticalAlign')
  public updateItemVerticalAlign(newValue: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sceneElement) {
        this.sceneElement.itemVerticalAlign = ItemVerticalAlign[newValue];
    
        const dimensionsUpdated = await this.sceneElement.draw();
        if (dimensionsUpdated) await this.sceneElement.drawParent();
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
  public async append(element: any): Promise<void> {
    return new Promise(async (resolve) => {
      element["parent"] = this.sceneElement;
      element["sequenceNo"] = this.el.children.length;
      element["vrEnabled"] = this.vrEnabled;

      this.el.appendChild(element);
          
      resolve();
    });
  }

  @Method()
  public async prepend(element: any): Promise<void> {
    return new Promise(async (resolve) => {
      element["parent"] = this.sceneElement;
      element["sequenceNo"] = 0;
      element["vrEnabled"] = this.vrEnabled;
      
      this.el.insertBefore(element, this.el.firstChild);
          
      resolve();
    });
  }

  @Method()
  public async removeElement(element: any): Promise<void> {
    return new Promise(async (resolve) => {
      for (let i=0; i<this.el.children.length; i++) {
        if(element.sceneElement.uuid == (this.el.children[i] as any).sceneElement.uuid) {
          await element.destroy();
        }
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
    const config = {
      shadowsEnabled: this.shadowsEnabled,
      offset: this.offset,
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

    if (LMDivLayout[this.layout] == LMDivLayout.Column) this.sceneElement = new ColumnLMDiv(this.parent, GeometryUtils.parsePositionString(this.position), this.id, config);
    else this.sceneElement = new RowVRDiv(this.parent, GeometryUtils.parsePositionString(this.position), this.id, config);
    
    let sequenceNo = 0;

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
