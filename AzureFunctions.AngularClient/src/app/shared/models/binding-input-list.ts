import {BindingInputBase, CheckBoxListInput} from './binding-input';
import {SettingType, Action} from './binding';

export class BindingInputList {
    inputs: BindingInputBase<any>[] = [];
    originInputs: BindingInputBase<any>[] = [];
    leftInputs: BindingInputBase<any>[] = [];
    rightInputs: BindingInputBase<any>[] = [];
    label: string;
    description: string;
    documentation: string;
    actions: Action[];

    saveOriginInputs() {
        this.originInputs = JSON.parse(JSON.stringify(this.inputs));

        this.orderInputs();
    }

    orderInputs() {

        this.rightInputs = [];
        this.leftInputs = [];
        var pushLeft = true;
        this.inputs.forEach((input, index) => {
            if (!input.isHidden) {
                if (pushLeft) {
                    this.leftInputs.push(input);
                } else {
                    this.rightInputs.push(input);
                }
                pushLeft = !pushLeft;
            }
        });
    }

    isDirty(): boolean {
        for (var i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].type === SettingType.checkBoxList) {
                var checkBoxList = <CheckBoxListInput>this.inputs[i];
                var origcheckBoxList = <CheckBoxListInput>this.originInputs[i];
                if (!checkBoxList.isEqual(origcheckBoxList)) {
                    return true;
                }
            } else {
                if (this.inputs[i].value !== this.originInputs[i].value) {
                    return true;
                }
            }
        }
        return false;
    }

    isValid() {
        var result = true;
        this.inputs.forEach((input) => {
            if (!input.isValid) {
                result = false;
            }
        });
        return result;
    }

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