import { 
    Mesh,
    Object3D,
    Box3,
    Group
} from 'three';

import { ItemVerticalAlign } from '../../geometry/ItemVerticalAlign';

import { SceneElement } from "../SceneElement";
import { VRDivConfig } from './VRDivConfig';
import { VRDiv } from './VRDiv';
import { GeometryUtils } from '../../geometry/GeometryUtils';

export class ColumnVRDiv extends VRDiv {
    constructor(depth: number, parent: SceneElement, config: VRDivConfig) {
        super(depth, parent, config);
    }

    public centerContentBox(childLayoutContainer: Object3D): void {
        let normalizingBox = new Box3().setFromObject(childLayoutContainer);

        childLayoutContainer.position.x = ((normalizingBox.max.x-normalizingBox.min.x)/2)*-1;
    }

    public async getContent(): Promise<Group> {
        return new Promise(async (resolve) => {
            this.setContentObject(new Object3D());
            this.getContentObject().position.z += (this.getDepth()*0.2);

            // Build out the child content

            let keys = Array.from(this.getChildElements().keys());
            keys.sort(function(a, b){return a-b});

            const childLayoutContainer = new Object3D();

            for (let i=0; i< keys.length; i++) {
                const childElement = this.getChildElements().get(keys[i]);
                
                if (childElement.getVisible()) {
                    const childLayout = await childElement.getContent(); 

                    const childLayoutBox = new Box3().setFromObject(childLayout);

                    childLayout.position.x -= childLayoutBox.min.x;

                    childLayout.translateY((childLayoutBox.max.y-(childLayoutBox.max.y-childLayoutBox.min.y)/2)*-1);

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

            if (await this.resizeFullWidthPanels(mesh, childLayoutContainer)) {
                this.repositionContainer(mesh, childLayoutContainer);
            }

            this.resizePanelBody(mesh, childLayoutContainer);

            this.getContentObject().rotation.set(GeometryUtils.degToRad(this.getXRotation(),), GeometryUtils.degToRad(this.getYRotation()), GeometryUtils.degToRad(this.getZRotation()));
            
            if ((this.getXRotation()) || (this.getYRotation()) || (this.getZRotation())) {
                this.getContentObject().rotation.set(GeometryUtils.degToRad(this.getXRotation(),), GeometryUtils.degToRad(this.getYRotation()), GeometryUtils.degToRad(this.getZRotation()));
                
                const rotatedElement = new Box3().setFromObject(this.getContentObject());
                this.getContentObject().position.z += ((rotatedElement.max.z-rotatedElement.min.z)/2);
            }

            resolve(this.getContentObject());
        });
    }

    public layoutChildrenItems(childLayoutContainer: Object3D): void {
        let currentSize = 0;
            
        for (let i=0; i<childLayoutContainer.children.length; i++) {
            if (childLayoutContainer.children[i].visible) {
                const childLayoutBox = new Box3().setFromObject(childLayoutContainer.children[i]);

                childLayoutContainer.children[i].translateX(currentSize);

                currentSize += (childLayoutBox.max.x - childLayoutBox.min.x) + this.getMargin();
            }
        }

        const childLayoutContainerBox = new Box3().setFromObject(childLayoutContainer);
        
        for (let i=0; i< childLayoutContainer.children.length; i++) {
            if (childLayoutContainer.children[i].visible) {
                const childLayoutBox = new Box3().setFromObject(childLayoutContainer.children[i]);

                let yDiff = 0;

                if (this.getItemVerticalAlign() == ItemVerticalAlign.Top) {
                    yDiff = childLayoutContainerBox.max.y - childLayoutBox.max.y;
                }
                else if (this.getItemVerticalAlign() == ItemVerticalAlign.Bottom) {
                    yDiff = childLayoutContainerBox.min.y - childLayoutBox.min.y;
                }

                childLayoutContainer.children[i].position.y += yDiff;
            }
        }
    }

    public async resizeFullWidthPanels(mesh: Mesh,childLayoutContainer: Object3D): Promise<boolean> {
        return new Promise(async (resolve) => {
            const meshBox = new Box3().setFromObject(mesh);
            const totalBox = new Box3().setFromObject(childLayoutContainer);
            const spareSpace = ((meshBox.max.x-meshBox.min.x)-(this.getPadding()*2))-(totalBox.max.x-totalBox.min.x);

            const widthUpdated = (spareSpace > 0);
            
            if (spareSpace > 0) {
                let totalSpace = spareSpace;

                let dynamicWidths = [];
                
                let keys = Array.from(this.getChildElements().keys());
                keys.sort(function(a, b){return a-b});

                for (let i=0; i< keys.length; i++) {
                    const childElement = this.getChildElements().get(keys[i]);

                    if (childElement.getVisible()) {
                        const dimensions = childElement.getDimensions(); 

                        if (!dimensions.width) {
                            const dimensions = new Box3().setFromObject(await childElement.getContent());
                            
                            totalSpace += dimensions.width;
                            dynamicWidths.push(childElement);
                        }
                    }
                }

                let seperateSpace = totalSpace/dynamicWidths.length;

                for (let i=(dynamicWidths.length-1); i>=0 ; i--) {
                    if (dynamicWidths[i].getCalculatedDimensions().width > seperateSpace) {
                        totalSpace -= dynamicWidths[i].getCalculatedDimensions().width;
                        seperateSpace = totalSpace/(dynamicWidths.length-1);
                        dynamicWidths.splice(i,1);
                    }
                }
                
                if (dynamicWidths.length > 0) {
                    for (let i=0; i< dynamicWidths.length; i++) {
                        await dynamicWidths[i].setCalculatedWidth(seperateSpace);
                    }

                    childLayoutContainer.position.x = 0;
                    childLayoutContainer.position.y = 0;
                    
                    for (let i=0; i<childLayoutContainer.children.length; i++) {
                        const childLayoutBox = new Box3().setFromObject(childLayoutContainer.children[i]);

                        childLayoutContainer.children[i].position.x = (childLayoutBox.max.x-childLayoutBox.min.x)/2;
                    }

                    this.layoutChildrenItems(childLayoutContainer);
                    
                    this.centerContentBox(childLayoutContainer);
                }
            }

            resolve(widthUpdated);
        });
    }
}