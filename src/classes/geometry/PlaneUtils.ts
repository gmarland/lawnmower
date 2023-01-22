import { 
    BufferGeometry,
    BoxGeometry,
    Shape,
    ShapeGeometry,
    ExtrudeGeometry,
    Mesh,
    Box3,
    Vector3
} from 'three';

export class PlaneUtils {
    public static getPlane(width: number, height: number, borderRadius: number): BufferGeometry {
        if ((borderRadius === 0) || (width === 0) || (height === 0)) {
            return PlaneUtils.getSquaredPlane(width, height);
        }
        else {
            return PlaneUtils.getRoundedPlane(width, height, borderRadius);
        }
    }

    public static getSquaredPlane(width: number, height: number): BoxGeometry {
        return new BoxGeometry(width, height, 1);
    }

    public static getRoundedPlane(width: number, height: number, radius: number): ShapeGeometry {
        let x = (width/2)*-1; 
        let y = (height/2)*-1; 
        
        let shape = new Shape();

        shape.moveTo( x + radius, y);

        shape.lineTo( x + width - radius, y);

        shape.bezierCurveTo(x + width - radius, y, x + width, y, x + width, y+radius );

        shape.lineTo( x + width, y + height - radius );

        shape.bezierCurveTo( x + width, y + height - radius, x + width, y + height, x + width-radius, y + height );

        shape.lineTo( x + radius, y + height );

        shape.bezierCurveTo( x + radius, y + height, x, y + height, x, y + height-radius);
        
        shape.lineTo( x, y+radius);
        
        shape.bezierCurveTo( x, y+radius, x, y, x + radius, y );

        const geometry = new ExtrudeGeometry(shape, {
            steps: 1,
            depth: 0.5,
            bevelEnabled: false,
            bevelThickness: 0,
            bevelSize: 0,
            bevelOffset: 0,
            bevelSegments: 0
        });

        return geometry;
    }

    public static generateMeshUVs(mesh: Mesh) {
        var box = new Box3().setFromObject(mesh);

        var size = new Vector3();

        box.getSize(size);
        
        var vec3 = new Vector3();
        
        var attPos = mesh.geometry.attributes.position;
        var attUv = mesh.geometry.attributes.uv;

        for (let i = 0; i < attPos.count; i++){
            vec3.fromBufferAttribute(attPos, i);

            attUv.setXY(i,
                (vec3.x - box.min.x) / size.x,
                (vec3.y - box.min.y) / size.y
            );
        }
    }
}