import { 
    Group
} from 'three';

import { GLTFLoader } from '../../../loaders/GLTFLoader.js';

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
