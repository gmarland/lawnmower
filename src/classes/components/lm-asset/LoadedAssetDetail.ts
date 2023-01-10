import { 
    AnimationClip,
    Object3D
} from 'three';

export interface LoadedAssetDetail {
    element: Object3D;
    
    animations: Array<AnimationClip>;
}