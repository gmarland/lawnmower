import { SceneElement } from "./SceneElement";
import { VRImage } from "./vr-image/VRImage";

export class SceneElementFactory {
    public static getSceneElement(elementName: string): SceneElement {
        switch (elementName.toLowerCase()) {
            case "vr-image":
                return new VRImage(null, null, null);
            default:
                return null;
        }
    }
}