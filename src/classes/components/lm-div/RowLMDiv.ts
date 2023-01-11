import { 
    Object3D,
    Box3,
    Group
} from 'three';

import { ItemHorizontalAlign } from '../../geometry/ItemHorizontalAlign';

import { SceneElement } from "../SceneElement";
import { LMDivConfig } from './LMDivConfig';
import { LMDiv } from './LMDiv';
import { GeometryUtils } from '../../geometry/GeometryUtils';

export class RowVRDiv extends LMDiv {
    constructor(depth: number, parent: SceneElement, id: string, config: LMDivConfig) {
        super(depth, parent, id, config);
    }

    public layoutChildrenItems(childLayoutContainer: Object3D): void {
        this.resetChildPositions(childLayoutContainer);

        let currentSize = 0;
        
        for (let i=0; i<childLayoutContainer.children.length; i++) {
            if (childLayoutContainer.children[i].visible) {
                const childLayoutBox = new Box3().setFromObject(childLayoutContainer.children[i]);
                
                childLayoutContainer.children[i].translateY(currentSize*-1);

                currentSize += (childLayoutBox.max.y - childLayoutBox.min.y) + this.margin;
            }
        }

        const childLayoutContainerBox = new Box3().setFromObject(childLayoutContainer);
        
        for (let i=0; i< childLayoutContainer.children.length; i++) {
            if (childLayoutContainer.children[i].visible) {
                const childLayoutBox = new Box3().setFromObject(childLayoutContainer.children[i]);
        
                let xDiff = 0;

                if (this.itemHorizontalAlign == ItemHorizontalAlign.Left) {
                    xDiff = childLayoutContainerBox.min.x - childLayoutBox.min.x;
                }
                else if (this.itemHorizontalAlign == ItemHorizontalAlign.Right) {
                    xDiff = childLayoutContainerBox.max.x - childLayoutBox.max.x;
                }

                childLayoutContainer.children[i].translateX(xDiff);
            }
        }
    }

    public async resizeFullWidthPanels(width: number, childLayoutContainer: Object3D): Promise<boolean> {
        return new Promise(async (resolve) => {
            const meshBox = new Box3().setFromObject(childLayoutContainer);
            const childWidth = ((meshBox.max.x-meshBox.min.x));

            let spareSpace;
            
            if (width && (((width - this.padding)*2) > childWidth)) {
                spareSpace = (width - this.padding);
            } 
            else {
                spareSpace = childWidth;
            }

            let widthsUpdated = false;

            let keys = Array.from(this.childElements.keys());
            keys.sort(function(a, b){return a-b});

            for (let i=0; i< keys.length; i++) {
                const childElement = this.childElements.get(keys[i]);

                if ((childElement.visible) && (childElement.dynamicWidth)) {
                    const actualDimensions = new Box3().setFromObject(await childElement.getContent())
                    const actualWidth = actualDimensions.max.x-actualDimensions.min.x;
                    
                    if (actualWidth != spareSpace) {
                        childElement.width = spareSpace;
                        await childElement.draw();

                        widthsUpdated = true;
                    }
                }
            }

            resolve(widthsUpdated);
        });
    }

    public resetChildPositions(childLayoutContainer: Object3D): void {
        childLayoutContainer.position.x = 0;
        childLayoutContainer.position.y = 0;

        for (let i=0; i<childLayoutContainer.children.length; i++) {
            const childLayoutBox = new Box3().setFromObject(childLayoutContainer.children[i]);

            childLayoutContainer.children[i].position.y = ((childLayoutBox.max.y-childLayoutBox.min.y)/2)*-1;
        }
    }

    public centerContentBox(childLayoutContainer: Object3D): void {
        childLayoutContainer.translateY((GeometryUtils.getDimensions(childLayoutContainer).height/2));
    }

    public async generateContent(childLayoutContainer: Object3D): Promise<void> {
        return new Promise(async (resolve) => {
            for (let i=(childLayoutContainer.children.length-1); i>=0; i--) {
                childLayoutContainer.remove(childLayoutContainer.children[i]);
            }

            let keys = Array.from(this.childElements.keys());
            keys.sort(function(a, b){return a-b});
    
            for (let i=0; i< keys.length; i++) {
                const childContent = await this.childElements.get(keys[i]);

                if (childContent.visible) {
                    const childLayout = await childContent.getContent(); 

                    const container = new Group();
                    container.add(childLayout);

                    childLayoutContainer.add(container);
                }
            }
            
            this.layoutChildrenItems(childLayoutContainer);
        
            this.centerContentBox(childLayoutContainer);
            
            if (await this.resizeFullWidthPanels(this.width, childLayoutContainer)) {
                this.layoutChildrenItems(childLayoutContainer);
                
                this.centerContentBox(childLayoutContainer);
            }
            
            if (this.xRotation || this.yRotation || this.zRotation) {
                this.contentObject.rotation.set(GeometryUtils.degToRad(this.xRotation), GeometryUtils.degToRad(this.yRotation), GeometryUtils.degToRad(this.zRotation));
                
                const rotatedElement = new Box3().setFromObject(this.contentObject);
                this.contentObject.position.z += ((rotatedElement.max.z-rotatedElement.min.z)/2);
            }

            resolve();
        });
    }
}