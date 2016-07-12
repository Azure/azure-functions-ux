import {FunctionConfig} from '../models/function-config';

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

export interface CreateFunctionInfoV3 {
    files: any;
    name: string;
    containerScmUrl: string;
    config: FunctionConfig;
}