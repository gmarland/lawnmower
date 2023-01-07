import { 
    Mesh,
    Object3D,
    Box3
} from 'three';

import { Dimensions } from './Dimensions';

export class GeometryUtils {
    public static degToRad(degrees: number): number {
        return degrees * Math.PI / 180;
    }

    public static radToDeg(rads: number): number {
        return rads * (180/Math.PI);
    }

    public static roundNumber(num: number): number {
        if (num % 1 != 0) return parseInt(num.toFixed(2));
        else return num;
    }

    public static normalizePosition(rads: number): number {
        let normalizedRotation = GeometryUtils.radToDeg(rads)%360
        if (normalizedRotation < 0) normalizedRotation = 360 + normalizedRotation;
        
        return GeometryUtils.degToRad(normalizedRotation);
    }

    public static getDimensions(obj: Object3D): Dimensions {
        const dimensions = new Box3().setFromObject(obj);
        
        return {
            width: (dimensions.max.x-dimensions.min.x),
            height: (dimensions.max.y-dimensions.min.y)
        }
    }

    public static getClosestObject(selectedObjects: Array<any>): Mesh {
        let closestObject = null;

        for (let i=0; i<selectedObjects.length; i++) {
            if ((selectedObjects[i].object.visible) && (!selectedObjects[i].object.invisible)) {
                let parentObject = selectedObjects[i].object.parent;
                let parentVisible = true;
    
                while ((parentObject) && (parentObject.type.toLowerCase() !== "scene")) {
                    if ((!parentObject.visible) || (parentObject.invisible)) {
                        parentVisible = false;
                        break;
                    }
                    parentObject = parentObject.parent;
                }

                if (parentVisible) {
                    if ((closestObject === null) ||
                        (closestObject.distance > selectedObjects[i].distance)) {
                        closestObject = selectedObjects[i];
                    }
                }
            }
        }
        
        return closestObject;
    }
}