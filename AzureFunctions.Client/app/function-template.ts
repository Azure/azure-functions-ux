import {TemplateInput} from './template-input';

export interface FunctionTemplate {
    id: string;
    trigger: string;
    inputs: TemplateInput[];
    language: string;
}