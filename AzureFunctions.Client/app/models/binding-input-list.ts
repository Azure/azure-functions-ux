import {BindingInputBase} from './binding-input';
import {SettingType} from './binding';

export class BindingInputList {
    inputs: BindingInputBase<any>[] = [];
    originInputs: BindingInputBase<any>[] = [];
    leftInputs: BindingInputBase<any>[] = [];
    rightInputs: BindingInputBase<any>[] = [];
    label: string;
    description: string;

    saveOriginInputs() {
        this.originInputs = JSON.parse(JSON.stringify(this.inputs));


        this.rightInputs = [];
        this.leftInputs = [];
        var pushLeft = true;
        this.inputs.forEach((input, index) => {
            if (pushLeft) {
                this.leftInputs.push(input);
            } else {
                this.rightInputs.push(input);
            }
            pushLeft = !pushLeft;
        });
    }

    isDirty() {
        // TODO: change to variable as angular2 pulls the function forever
        var result = false;
        for (var i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].value !== this.originInputs[i].value) {
                result = true;
            }

            if (this.inputs[i].type === SettingType.string) {
                var anyObj: any = this.inputs[i];
                if (anyObj.setClass) {
                    anyObj.setClass();
                }
            }
        }
        return result;
    }

    //isValid() {
    //    this.inputs.forEach((input) => {
    //        var tb = <TextboxInput>input;

    //        if (tb) {
    //            tb.valid = tb.value ? true : false;
    //        }
    //    });
    //}

    discard() {
        this.inputs = JSON.parse(JSON.stringify(this.originInputs));
        this.saveOriginInputs();
    }

    getInput(id: string): BindingInputBase<any> {

        return this.inputs.find((i) => {
            return i.id === id;
        });
    }
}