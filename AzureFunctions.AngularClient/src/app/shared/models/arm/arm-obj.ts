export interface ArmObj<T> {
    id: string;
    name: string;
    type: string;
    kind: string;
    location: string;
    properties: T
}