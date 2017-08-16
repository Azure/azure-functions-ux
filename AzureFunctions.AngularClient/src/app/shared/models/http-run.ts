export class HttpRunModel {
    method: string;
    availableMethods: string[] = [];
    queryStringParams: Param[] = [];
    headers: Param[] = [];
    body: string;

    constructor() {
    }
}

export interface Param {
    name: string;
    value: string;
}

