import { 
    Group,
    Vector3
} from 'three';

import { ISceneElement } from './ISceneElement';

export class BaseSceneElement {
    private _initialized: boolean;
    
    private _parent: ISceneElement;

    private _position?: Vector3;

    private _id: string;

    private _content: Group;

    constructor(parent: ISceneElement, position: Vector3, id: string) {
        this._initialized = false;

        this._parent = parent;

        this._position = position;
        
        this._id = id;

        this._content = new Group();
    }

    ////////// Getters

    public get initialized(): boolean {
        return this._initialized;
    }
    
    public get parent(): Group {
        return this._parent;
    }
    
    public get content(): Group {
        return this._content;
    }
    
    public get id(): string {
        return this._id;
    }
    
    public get uuid(): string {
        return this._content.uuid;
    }
    
    public get position(): Vector3 {
        return this._position;
    }

    public get visible(): boolean {
        return this._content.visible;
    }

    ////////// Setters

    public set initialized(value: boolean) {
        this._initialized = value;
    }
    
    public set content(value: Group) {
        this._content = value;
    }

    public set id(value: string) {
        this._id = value;
    }
    
    public set position(value: Vector3) {
        this._position = value;
    }

    public set visible(value: boolean) {
        this._content.visible = value;
    }

    public getIsChildElement(uuid: string): boolean {
        return uuid === this.uuid;
    }
};