import {SettingType, EnumOption, ResourceType} from './binding';

export class BindingInputBase<T>
{
    value: T;
    id: string;
    label: string;    
    required: boolean;   
    type: SettingType;
    help: string;
}

export class CheckboxInput extends BindingInputBase<boolean>{
    constructor() {
        super();
        this.type = SettingType.boolean;
    }
}


export class TextboxInput extends BindingInputBase<string>{
    class: string = 'col-sm-6 input-group';

    constructor() {
        super();
        this.type = SettingType.string;
    }

    setClass() {
        this.class = this.value ? 'col-sm-6  input-group' : 'col-sm-6  input-group has-error';
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

    constructor() {
        super();        
        this.type = SettingType.picker;
    }

    setButtonNoActive() {        
        this.inProcess = false;
    }

    setButtonActive() {        
        this.inProcess = true;
    }
}