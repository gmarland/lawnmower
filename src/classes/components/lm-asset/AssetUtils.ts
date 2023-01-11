import { 
    Group,
    Vector3,
    Box3
} from 'three';

export class AssetUtils {
    public static resetAssetMesh(asset: any) {
        asset.scale.set(1, 1, 1);

        asset.position.set(0, 0, 0);
    }

    public static resizeAssetMesh(asset: any, size: number) {
        const box = new Box3().setFromObject(asset);

        const originalDimensions = new Vector3((box.max.x-box.min.x), (box.max.y-box.min.y), (box.max.z-box.min.z));

        let dimension = "x";
        let value = originalDimensions.x;

        if (originalDimensions.y > value) {
            dimension = "y";
            value = originalDimensions.y;
        }

        if (originalDimensions.z > value) {
            dimension = "z";
            value = originalDimensions.z;
        }

        let currentDimension = null;

        if (dimension === "y") {
            currentDimension = originalDimensions.y;
        }
        else if (dimension === "x") {
            currentDimension = originalDimensions.x;
        }
        else if (dimension === "z") {
            currentDimension = originalDimensions.z;
        }
        
        if (currentDimension !== null) {
            const scale = size/currentDimension;
            
            asset.scale.set(scale, scale, scale);

            asset.position.set(asset.position.x, asset.position.y, asset.position.z);
        }
        
        let resizedBox = new Box3().setFromObject(asset);

        const positioningOffset =  new Vector3(((resizedBox.max.x+resizedBox.min.x)/2)*-1, ((resizedBox.max.y+resizedBox.min.y)/2)*-1, ((resizedBox.max.z+resizedBox.min.z)/2)*-1);

        asset.translateX(positioningOffset.x);
        asset.translateY(positioningOffset.y);
        asset.translateZ(positioningOffset.z);
    }
    
    public static getAssetParent(assetObject: any): Group {
        if (assetObject && assetObject.parent) {
            if (assetObject.parent.type == "Group") return assetObject.parent;
            else return this.getAssetParent(assetObject.parent);
        }
        else return null;
    }
}