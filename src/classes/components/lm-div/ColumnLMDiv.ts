import { 
    Object3D,
    Box3,
    Group,
    Vector3
} from 'three';

import { ItemVerticalAlign } from '../../geometry/ItemVerticalAlign';

import { ISceneElement } from "../ISceneElement";
import { LMDivConfig } from './LMDivConfig';
import { LMDiv } from './LMDiv';
import { GeometryUtils } from '../../geometry/GeometryUtils';

export class ColumnLMDiv extends LMDiv {
    constructor(parent: ISceneElement, position: Vector3, id: string, config: LMDivConfig) {
        super(parent, position, id, config);
    }

    public layoutChildrenItems(childLayoutContainer: Object3D): void {
        this.resetChildPositions(childLayoutContainer);
            
        let currentSize = 0;
            
        for (let i=0; i<childLayoutContainer.children.length; i++) {
            if (childLayoutContainer.children[i].visible) {
                const childLayoutBox = new Box3().setFromObject(childLayoutContainer.children[i]);

                childLayoutContainer.children[i].translateX(currentSize);

                currentSize += (childLayoutBox.max.x - childLayoutBox.min.x) + this.margin;
            }
        }

        const childLayoutContainerBox = new Box3().setFromObject(childLayoutContainer);
        
        for (let i=0; i< childLayoutContainer.children.length; i++) {
            if (childLayoutContainer.children[i].visible) {
                const childLayoutBox = new Box3().setFromObject(childLayoutContainer.children[i]);

                let yDiff = 0;

                if (this.itemVerticalAlign == ItemVerticalAlign.Top) {
                    yDiff = childLayoutContainerBox.max.y - childLayoutBox.max.y;
                }
                else if (this.itemVerticalAlign == ItemVerticalAlign.Bottom) {
                    yDiff = childLayoutContainerBox.min.y - childLayoutBox.min.y;
                }

                childLayoutContainer.children[i].position.y += yDiff;
            }
        }
    }

    public async resizeFullWidthPanels(width: number, childLayoutContainer: Object3D): Promise<boolean> {
        return new Promise(async (resolve) => {
            const totalBox = new Box3().setFromObject(childLayoutContainer);
            let childSize = (totalBox.max.x-totalBox.min.x);
            
            const spareSpace = (width-(this.padding*2))-childSize;

            const widthUpdated = (spareSpace > 0);
            
            if (spareSpace > 0) {
                let totalSpace = spareSpace;

                let dynamicWidths = [];
                
                let keys = Array.from(this.childElements.keys());
                keys.sort(function(a, b){return a-b});

                for (let i=0; i< keys.length; i++) {
                    const childElement = this.childElements.get(keys[i]);

                    if ((childElement.visible) && (childElement.dynamicWidth)) {
                        const actualDimensions = new Box3().setFromObject(await childElement.getContent())
                        const actualWidth = actualDimensions.max.x-actualDimensions.min.x;
                        
                        totalSpace += actualWidth;
                        dynamicWidths.push(childElement);
                    }
                }

                let seperateSpace = totalSpace/dynamicWidths.length;

                for (let i=(dynamicWidths.length-1); i>=0 ; i--) {
                    const actualDimensions = new Box3().setFromObject(await dynamicWidths[i].getContent());
                    const actualWidth = actualDimensions.max.x-actualDimensions.min.x;

                    if (actualWidth > seperateSpace) {
                        totalSpace -= actualWidth;
                        seperateSpace = totalSpace/(dynamicWidths.length-1);
                        dynamicWidths.splice(i,1);
                    }
                }
                
                if (dynamicWidths.length > 0) {
                    for (let i=0; i< dynamicWidths.length; i++) {
                        dynamicWidths[i].width = seperateSpace;
                        await dynamicWidths[i].draw();
                    }
                }
            }

            resolve(widthUpdated);
        });
    }

    public resetChildPositions(childLayoutContainer: Object3D): void {
        childLayoutContainer.position.x = 0;
        childLayoutContainer.position.y = 0;
        
        for (let i=0; i<childLayoutContainer.children.length; i++) {
            childLayoutContainer.children[i].position.x = GeometryUtils.getDimensions(childLayoutContainer.children[i]).width/2;
        }
    }

    public centerContentBox(childLayoutContainer: Object3D): void {
        childLayoutContainer.position.x -= (GeometryUtils.getDimensions(childLayoutContainer).width/2);
    }

    public async generateContent(childLayoutContainer: Object3D): Promise<void> {
        return new Promise(async (resolve) => {
            childLayoutContainer.clear();

            let keys = Array.from(this.childElements.keys());
            keys.sort(function(a, b){return a-b});

            for (let i=0; i< keys.length; i++) {
                const childElement = this.childElements.get(keys[i]);
                
                if (childElement.visible) {
                    const childLayout = await childElement.getContent(); 

                    const container = new Group();
                    container.add(childLayout);

                    const childLayoutBox = new Box3().setFromObject(container);

                    container.translateX(childLayoutBox.min.x*-1);
                    container.translateY((childLayoutBox.max.y-(childLayoutBox.max.y-childLayoutBox.min.y)/2)*-1);

                    childLayoutContainer.add(container);
                }
            }

            this.layoutChildrenItems(childLayoutContainer);

            this.centerContentBox(childLayoutContainer);
            
            if (await this.resizeFullWidthPanels(this.width, childLayoutContainer)) {
                this.layoutChildrenItems(childLayoutContainer);
                
                this.centerContentBox(childLayoutContainer);
            }

            this.content.rotation.set(GeometryUtils.degToRad(this.xRotation,), GeometryUtils.degToRad(this.yRotation), GeometryUtils.degToRad(this.zRotation));
            
            if ((this.xRotation) || (this.yRotation) || (this.zRotation)) {
                this.content.rotation.set(GeometryUtils.degToRad(this.xRotation), GeometryUtils.degToRad(this.yRotation), GeometryUtils.degToRad(this.zRotation));
                
                const rotatedElement = new Box3().setFromObject(this.content);
                this.content.position.z += ((rotatedElement.max.z-rotatedElement.min.z)/2);
            }

            resolve();
        });
    }
}