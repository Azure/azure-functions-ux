import { FunctionBindingBase } from './binding';

export interface FunctionTemplate {
    name: string;
    language: LanguageType;
    bindings: FunctionBindingBase[];
}

export interface TemplateFilterItem {
    name: string;
    value: string;
}

export enum LanguageType {
    Javascript = <any>"Javascript",
    CSharp = <any>"CSharp"
    //Python,
    //Php,
    //FortranSharp,
    //Batch,
    //PowerShell,
    //Bash
}