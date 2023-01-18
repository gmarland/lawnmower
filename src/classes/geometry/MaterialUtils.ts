import {
    MeshLambertMaterial
} from 'three'

export class MaterialUtils {
    public static getBasicMaterial(options: object): MeshLambertMaterial {
        return new MeshLambertMaterial(options);
    }
}   