export enum TemplatePickerType {
    trigger,
    input,
    output,
    template,
    none
}

export interface Template {
    name: string;
    value: string;
    image?: string;
    key?: string;
}