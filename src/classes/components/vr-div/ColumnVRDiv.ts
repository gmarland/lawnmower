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
            if (!this.getInitialized()) {
                this.setInitialized(true);
                
                // Build out the child content

                const childLayoutContainer = new Object3D();
                childLayoutContainer.name = "child";

                // Build out the panel

                const body = this.buildPanelMesh();

                this.getContentObject().add(body);
                this.getContentObject().add(childLayoutContainer);
                
                await this.generateContent(body, childLayoutContainer);

                this.resizePanelBody(body, childLayoutContainer);
            }

            resolve(this.getContentObject());
        });
    }

    public layoutChildrenItems(childLayoutContainer: Object3D): void {
        this.resetChildPositions(childLayoutContainer);
        
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

    public async resizeFullWidthPanels(width: number, childLayoutContainer: Object3D): Promise<boolean> {
        return new Promise(async (resolve) => {
            const totalBox = new Box3().setFromObject(childLayoutContainer);
            const spareSpace = (width-(this.getPadding()*2))-(totalBox.max.x-totalBox.min.x);

            const widthUpdated = (spareSpace > 0);
            
            if (spareSpace > 0) {
                let totalSpace = spareSpace;

                let dynamicWidths = [];
                
                let keys = Array.from(this.getChildElements().keys());
                keys.sort(function(a, b){return a-b});

                for (let i=0; i< keys.length; i++) {
                    const childElement = this.getChildElements().get(keys[i]);

                    if (childElement.visible) {
                        const dimensions = childElement.getDimensions(); 

                        if (!dimensions.width) {
                            const actualDimensions = new Box3().setFromObject(await childElement.getContent())
                            const actualWidth = actualDimensions.max.x-actualDimensions.min.x;
                            
                            totalSpace += actualWidth;
                            dynamicWidths.push(childElement);
                        }
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
            const childLayoutBox = new Box3().setFromObject(childLayoutContainer.children[i]);

            childLayoutContainer.children[i].position.x = (childLayoutBox.max.x-childLayoutBox.min.x)/2;
        }
    }

    public async generateContent(body: Mesh, childLayoutContainer: Object3D): Promise<void> {
        return new Promise(async (resolve) => {
            for (let i=(childLayoutContainer.children.length-1); i>=0; i--) {
                childLayoutContainer.remove(childLayoutContainer.children[i]);
            }

            let keys = Array.from(this.getChildElements().keys());
            keys.sort(function(a, b){return a-b});
    

            for (let i=0; i< keys.length; i++) {
                const childElement = this.getChildElements().get(keys[i]);
                
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
            
            this.repositionContainer(body, childLayoutContainer);

            const meshBox = new Box3().setFromObject(body);
            
            if (await this.resizeFullWidthPanels(meshBox.max.x-meshBox.min.x, childLayoutContainer)) {
                this.layoutChildrenItems(childLayoutContainer);
                
                this.centerContentBox(childLayoutContainer);

                this.repositionContainer(body, childLayoutContainer);
            }

            this.getContentObject().rotation.set(GeometryUtils.degToRad(this.getXRotation(),), GeometryUtils.degToRad(this.getYRotation()), GeometryUtils.degToRad(this.getZRotation()));
            
            if ((this.getXRotation()) || (this.getYRotation()) || (this.getZRotation())) {
                this.getContentObject().rotation.set(GeometryUtils.degToRad(this.getXRotation()), GeometryUtils.degToRad(this.getYRotation()), GeometryUtils.degToRad(this.getZRotation()));
                
                const rotatedElement = new Box3().setFromObject(this.getContentObject());
                this.getContentObject().position.z += ((rotatedElement.max.z-rotatedElement.min.z)/2);
            }

            resolve();
        });
    }
}