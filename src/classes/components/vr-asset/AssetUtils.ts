import { 
    Group,
    Vector3
} from 'three';

export class AssetUtils {
    public static resizeAssetMesh(asset: any, originalDimensions: Vector3, dimension: string, size: number) {
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
    }
    
    public static getAssetParent(assetObject: any): Group {
        if (assetObject && assetObject.parent) {
            if (assetObject.parent.type == "Group") return assetObject.parent;
            else return this.getAssetParent(assetObject.parent);
        }
        else return null;
    }
}