import { 
    Mesh,
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

    public async resizeFullWidthPanels(width: number, childLayoutContainer: Object3D): Promise<boolean> {
        return new Promise(async (resolve) => {
            const meshBox = new Box3().setFromObject(childLayoutContainer);
            const childWidth = ((meshBox.max.x-meshBox.min.x));

            let spareSpace;
            
            if (width && (((width - this.getPadding())*2) > childWidth)) {
                spareSpace = (width - this.getPadding());
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
                        const actualDimensions = new Box3().setFromObject(await childElement.getContent())
                        const actualWidth = actualDimensions.max.x-actualDimensions.min.x;
                        
                        if (actualWidth != spareSpace) {
                            await childElement.setWidth(spareSpace);

                            widthsUpdated = true;
                        }
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
            childLayoutContainer.children[i].translateY(childLayoutBox.max.y*-1);
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
                const childContent = await this.getChildElements().get(keys[i]);

                if (childContent.getVisible()) {
                    const childLayout = await childContent.getContent(); 

                    const container = new Group();
                    container.add(childLayout);

                    childLayoutContainer.add(container);
                }
            }
            
            this.layoutChildrenItems(childLayoutContainer);
        
            this.centerContentBox(childLayoutContainer);

            this.repositionContainer(body, childLayoutContainer);
            
            const meshBox = new Box3().setFromObject(body);

            if (await this.resizeFullWidthPanels(meshBox.max.x-meshBox.min.x, childLayoutContainer)) {
                this.resetChildPositions(childLayoutContainer);

                this.layoutChildrenItems(childLayoutContainer);
                
                this.centerContentBox(childLayoutContainer);
                
                this.repositionContainer(body, childLayoutContainer);
            }
            
            if ((this.getXRotation()) || (this.getYRotation()) || (this.getZRotation())) {
                this.getContentObject().rotation.set(GeometryUtils.degToRad(this.getXRotation(),), GeometryUtils.degToRad(this.getYRotation()), GeometryUtils.degToRad(this.getZRotation()));
                
                const rotatedElement = new Box3().setFromObject(this.getContentObject());
                this.getContentObject().position.z += ((rotatedElement.max.z-rotatedElement.min.z)/2);
            }

            resolve();
        });
    }
}