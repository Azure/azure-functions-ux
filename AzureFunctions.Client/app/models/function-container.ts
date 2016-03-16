export interface FunctionContainer {
    id: string;
    name: string;
    type: string;
    kind: string;
    location: string;
    properties: {
        hostNameSslStates: [{
            name: string;
            hostType: number;
        }];
    }
}