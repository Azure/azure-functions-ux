export class HttpRunModel {
    method: string;
    availableMethods: string[] = [];
    queryStringParams: Param[] = [];
    headers: Param[] = [];
    body: string;
    code: Param;

    constructor() {
    }
}

export interface Param {
    name: string;
    value: string;
}

