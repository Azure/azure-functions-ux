import {TemplateInput} from './template-input';
import {FunctionBinding} from './function-config';

export interface FunctionTemplate {
    id: string;
    function: FunctionTemplateBindings;
    metadata: FunctionTemplateMetadata;
    files: any;
}

export interface FunctionTemplateBindings {
    bindings: FunctionBinding[];
}

export interface FunctionTemplateMetadata {
    name: string;
    trigger: string;
    language: string;
    category?: string[];
    userPrompt?: string[];
    defaultFunctionName?: string;
    description?: string;
    visible?: boolean;
    filters?: string[];
    enabledInTryMode?: boolean;
}