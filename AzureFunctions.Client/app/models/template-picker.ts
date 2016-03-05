export enum TemplatePickerType {
    trigger,
    in,
    out,
    template,
    none
}

export interface Template {
    name: string;
    value: string;
    image?: string;
    key?: string;
}