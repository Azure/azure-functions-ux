export interface DesignerSchema {
    triggers: Binding[];
    inputs: Binding[];
    outputs: Binding[];
}

export interface Binding {
    name: string;
    options: BindingOption[];
}

export interface BindingOption {
    name: string;
    type: string;
    value: string;
    options?: BindingOption[];
}