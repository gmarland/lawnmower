import { 
    Mesh,
    Object3D,
    Box3,
    Vector3
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

    public static parsePositionString(postionString): Vector3 {
        if (postionString && (postionString.length > 0)) {
            const parts = postionString.split(',');

            if (parts.length === 3) {
                try {
                    return new Vector3(parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2]))
                }
                catch (err) {
                    console.log("Error parsing position string: " + postionString, err);
                }
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
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

    public static getMaxDimensions(obj: Object3D): number {
        const dimensions = new Box3().setFromObject(obj);
        
        const width = (dimensions.max.x-dimensions.min.x);
        const height = (dimensions.max.y-dimensions.min.y);
        const depth = (dimensions.max.z-dimensions.min.z);

        return (width > height ? (width > depth) ? width : depth  : (height > depth) ? height : depth);
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