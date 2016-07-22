import {SettingType, EnumOption, ResourceType, Validator} from './binding';

export class BindingInputBase<T>
{
    value: T;
    id: string;
    label: string;
    required: boolean;
    type: SettingType;
    help: string;

    errorClass: string;
    noErrorClass: string;
    class: string;
    isValid: boolean = true;
    isHidden: boolean = false;
    errorText: string;
    validators: Validator[] = [];
    changeValue: () => void;
    placeholder: string;
}

export class CheckboxInput extends BindingInputBase<boolean>{
    constructor() {
        super();
        this.type = SettingType.boolean;
    }
}


export class TextboxInput extends BindingInputBase<string>{

    constructor() {
        super();
        this.type = SettingType.string;
        this.noErrorClass = '';
        this.errorClass = 'has-error';
    }
}

export class LabelInput extends BindingInputBase<string>{
    constructor() {
        super();
        this.type = SettingType.label;
    }
}

export class SelectInput extends BindingInputBase<string>{
    enum: EnumOption[];

    constructor() {
        super();
        this.type = SettingType.enum;
    }
}

export class PickerInput extends BindingInputBase<string>{
    resource: ResourceType;
    inProcess: boolean = false;
    metadata: any;

    constructor() {
        super();
        this.type = SettingType.picker;
        this.noErrorClass = '';
        this.errorClass = 'has-error';
    }
}