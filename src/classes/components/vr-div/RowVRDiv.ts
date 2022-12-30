import { 
    Object3D,
    Box3,
    Group
} from 'three';

import { ItemHorizontalAlign } from '../../geometry/ItemHorizontalAlign';

import { SceneElement } from "../SceneElement";
import { VRDivConfig } from './VRDivConfig';
import { VRDiv } from './VRDiv';
import { GeometryUtils } from '../../geometry/GeometryUtils';

export class RowVRDiv extends VRDiv {
    constructor(depth: number, parent: SceneElement, config: VRDivConfig) {
        super(depth, parent, config);
    }

    public async getContent(): Promise<Group> {
        return new Promise(async (resolve) => {
            // Build out the child content
    
            let keys = Array.from(this.getChildElements().keys());
            keys.sort(function(a, b){return a-b});
            
            const childLayoutContainer = new Object3D();
            childLayoutContainer.name = "child";
    
            for (let i=0; i< keys.length; i++) {
                const childContent = await this.getChildElements().get(keys[i]);

                if (childContent.getVisible()) {
                    const childLayout = await childContent.getContent(); 
        
                    childLayoutContainer.add(childLayout);
                }
            }

            this.layoutChildrenItems(childLayoutContainer);
    
            this.centerContentBox(childLayoutContainer);
    
            // Build out the panel
    
            const mesh = this.buildPanelMesh();
    
            this.getContentObject().add(mesh);

            this.repositionContainer(mesh, childLayoutContainer);
    
            this.getContentObject().add(childLayoutContainer);

            if (await this.resizeFullWidthPanels(childLayoutContainer)) {
                this.repositionContainer(mesh, childLayoutContainer);
            }

            this.resizePanelBody(mesh, childLayoutContainer);
            
            if ((this.getXRotation()) || (this.getYRotation()) || (this.getZRotation())) {
                this.getContentObject().rotation.set(GeometryUtils.degToRad(this.getXRotation(),), GeometryUtils.degToRad(this.getYRotation()), GeometryUtils.degToRad(this.getZRotation()));
                
                const rotatedElement = new Box3().setFromObject(this.getContentObject());
                this.getContentObject().position.z += ((rotatedElement.max.z-rotatedElement.min.z)/2);
            }
    
            resolve(this.getContentObject());
        });
    }

    public centerContentBox(childLayoutContainer: Object3D): void {
        let normalizingBox = new Box3().setFromObject(childLayoutContainer);

        childLayoutContainer.position.y += ((normalizingBox.max.y-normalizingBox.min.y)/2);
    }

    public layoutChildrenItems(childLayoutContainer: Object3D): void {
        let currentSize = 0;

        for (let i=0; i<childLayoutContainer.children.length; i++) {
            if (childLayoutContainer.children[i].visible) {
                const childLayoutBox = new Box3().setFromObject(childLayoutContainer.children[i]);
                
                childLayoutContainer.children[i].translateY(currentSize*-1);

                currentSize += (childLayoutBox.max.y - childLayoutBox.min.y) + this.getMargin();
            }
        }

        const childLayoutContainerBox = new Box3().setFromObject(childLayoutContainer);
        
        for (let i=0; i< childLayoutContainer.children.length; i++) {
            if (childLayoutContainer.children[i].visible) {
                const childLayoutBox = new Box3().setFromObject(childLayoutContainer.children[i]);
        
                let xDiff = 0;

                if (this.getItemHorizontalAlign() == ItemHorizontalAlign.Left) {
                    xDiff = childLayoutContainerBox.min.x - childLayoutBox.min.x;
                }
                else if (this.getItemHorizontalAlign() == ItemHorizontalAlign.Right) {
                    xDiff = childLayoutContainerBox.max.x - childLayoutBox.max.x;
                }

                childLayoutContainer.children[i].translateX(xDiff);
            }
        }
    }

    public async resizeFullWidthPanels(childLayoutContainer: Object3D): Promise<boolean> {
        return new Promise(async (resolve) => {
            const meshBox = new Box3().setFromObject(childLayoutContainer);

            const panelWidth = this.getDimensions().width;
            const childWidth = ((meshBox.max.x-meshBox.min.x));

            let spareSpace;
            
            if (panelWidth && (((panelWidth - this.getPadding())*2) > childWidth)) {
                spareSpace = panelWidth;
            } 
            else {
                spareSpace = childWidth;
            }

            let widthsUpdated = false;

            let keys = Array.from(this.getChildElements().keys());
            keys.sort(function(a, b){return a-b});

            for (let i=0; i< keys.length; i++) {
                const childElement = this.getChildElements().get(keys[i]);
                
                if (childElement.getVisible()) {
                    const dimensions = childElement.getDimensions(); 

                    if (!dimensions.width) {
                        const calculatedWidth = (await childElement.getCalculatedDimensions()).width;
                        
                        if (calculatedWidth != spareSpace) {
                            await childElement.setCalculatedWidth(spareSpace);

                            widthsUpdated = true;
                        }
                    }
                }
            }

            if (widthsUpdated) {
                childLayoutContainer.position.x = 0;
                childLayoutContainer.position.y = 0;
                
                for (let i=0; i<childLayoutContainer.children.length; i++) {
                    if (childLayoutContainer.children[i].visible) {
                        const childLayoutBox = new Box3().setFromObject(childLayoutContainer.children[i]);
                        childLayoutContainer.children[i].translateY(childLayoutBox.max.y*-1);
                    }
                }

                this.layoutChildrenItems(childLayoutContainer);
                
                this.centerContentBox(childLayoutContainer);
            }

            resolve(widthsUpdated);
        });
    }
}