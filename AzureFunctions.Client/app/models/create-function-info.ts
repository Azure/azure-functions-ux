export interface CreateFunctionInfo {
    templateId: string;
    name: string;
    containerScmUrl: string;
}

export interface CreateFunctionInfoV2 {
    files : any;
    name: string;
    containerScmUrl: string;
}