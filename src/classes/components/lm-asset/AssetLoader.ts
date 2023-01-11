import { 
    Box3,
    Group,
    Vector3
} from 'three';

import { GLTFLoader } from '../../../utils/GLTFLoader.js';
import { AssetUtils } from './AssetUtils.js';
import { LoadedAssetDetail } from './LoadedAssetDetail.js';

export class AssetLoader {
    private _loader: GLTFLoader;
    
    constructor() {
        this._loader = new GLTFLoader();
    }

    public load(src: string): Promise<LoadedAssetDetail> {
        return new Promise((resolve) =>{
            this._loader.load(src, function(gltf: Group) {
                resolve({
                    element: gltf.scene, 
                    animations: gltf.animations
                });
            });
        });
    }
}
