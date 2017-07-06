export interface ArmObj<T> {
    id: string;
    name: string;
    type: string;
    kind: string;
    location: string;
    properties: T
}

export interface ArmArrayResult{
    value : ArmObj<any>[];
    nextLink : string;
}