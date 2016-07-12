import {FunctionConfig} from '../models/function-config';

export interface CreateFunctionInfo {
    templateId: string;
    name: string;
    containerScmUrl: string;
}
