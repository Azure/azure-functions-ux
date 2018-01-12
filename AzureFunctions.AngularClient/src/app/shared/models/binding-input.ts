import { SettingType, EnumOption, ResourceType, Validator } from './binding';

export class BindingInputBase<T>
{
    value: T;
    id: string;
    label: string;
    required: boolean;
    type: 'string' | 'boolean' | 'label' | 'enum' | 'int' | 'picker' | 'checkBoxList' | 'appSetting' | 'eventGrid';
    help: string;

    errorClass: string;
    noErrorClass: string;
    class: string;
    isValid: boolean = true;
    isHidden: boolean = false;
    errorText: string;
    validators: Validator[] = [];
    changeValue: (newValue?: any) => void;
    placeholder: string;
    explicitSave: boolean = false;

    isDisabled: boolean = false;
    showHelp: boolean = false;
    okEmpty: boolean;
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

export class TextboxIntInput extends BindingInputBase<number>{

    constructor() {
        super();
        this.type = SettingType.int;
        this.noErrorClass = '';
        this.errorClass = 'has-error';
    }
}

export class EventGridInput extends BindingInputBase<string>{

    bladeLabel: string;

    constructor() {
        super();
        this.type = SettingType.eventGrid;
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
    items: string[];

    constructor() {
        super();
        this.type = SettingType.picker;
        this.noErrorClass = '';
        this.errorClass = 'has-error';
    }
}

export class CheckBoxListInput extends BindingInputBase<any>{
    enum: EnumOption[];

    toInternalValue() {
        if (!this.value) {
            this.value = [];
        }

        var valueDup = this.value.slice();
        this.value = {};

        valueDup.forEach((v) => {
            this.value[v] = true;
        });
        this.enum.forEach((v) => {
            if (!this.value[v.value]) {
                this.value[v.value] = false;
            }
        });
    }

    clear() {
        this.enum.forEach((v) => {
            this.value[v.value] = false;
        });
    }

    getArrayValue(): string[] {
        var result = [];
        for (var property in this.value) {
            if (this.value.hasOwnProperty(property)) {
                if (this.value[property]) {
                    result.push(property);
                }
            }
        }
        return result;
    }

    isEqual(value: CheckBoxListInput): boolean {
        for (var property in this.value) {
            if (this.value.hasOwnProperty(property)) {
                if (this.value[property] !== value.value[property]) {
                    return false;
                }
            }
        }
        return true;
    }

    constructor() {
        super();
        this.type = SettingType.checkBoxList;
    }
}