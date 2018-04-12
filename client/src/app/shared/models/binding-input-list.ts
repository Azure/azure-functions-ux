import { BindingInputBase, CheckBoxListInput } from './binding-input';
import { SettingType, Action, Warning } from './binding';

export class BindingInputList {
    inputs: BindingInputBase<any>[] = [];
    originInputs: BindingInputBase<any>[] = [];
    leftInputs: BindingInputBase<any>[] = [];
    rightInputs: BindingInputBase<any>[] = [];
    label: string;
    description: string;
    documentation: string;
    actions: Action[];
    warnings: Warning[];

    saveOriginInputs() {
        this.originInputs = JSON.parse(JSON.stringify(this.inputs));

        this.orderInputs();
    }

    orderInputs() {

        this.rightInputs = [];
        this.leftInputs = [];
        let pushLeft = true;
        this.inputs.forEach(input => {
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
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].type === SettingType.checkBoxList) {
                const checkBoxList = <CheckBoxListInput>this.inputs[i];
                const origcheckBoxList = <CheckBoxListInput>this.originInputs[i];
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
        let result = true;
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