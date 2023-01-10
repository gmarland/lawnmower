import { 
    Box3,
    Group,
    Vector3
} from 'three';

import { GLTFLoader } from '../../../utils/GLTFLoader.js';
import { GeometryUtils } from '../../geometry/GeometryUtils.js';
import { AssetUtils } from './AssetUtils.js';
import { LoadedAssetDetail } from './LoadedAssetDetail.js';

export class AssetLoader {
    private _loader: GLTFLoader;
    
    constructor() {
        this._loader = new GLTFLoader();
    }

    public load(src: string, radius: number): Promise<LoadedAssetDetail> {
        return new Promise((resolve) =>{
            this._loader.load(src, function(gltf: Group) {
                const box = new Box3().setFromObject(gltf.scene);

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
                
                AssetUtils.resizeAssetMesh(gltf.scene, originalDimensions, dimension, radius);

                let resizedBox = new Box3().setFromObject(gltf.scene);

                const positioningOffset =  new Vector3(((resizedBox.max.x+resizedBox.min.x)/2)*-1, ((resizedBox.max.y+resizedBox.min.y)/2)*-1, ((resizedBox.max.z+resizedBox.min.z)/2)*-1);

                gltf.scene.translateX(positioningOffset.x);
                gltf.scene.translateY(positioningOffset.y);
                gltf.scene.translateZ(positioningOffset.z);

                resolve({
                    element: gltf.scene, 
                    animations: gltf.animations
                });
            });
        });
    }
}
