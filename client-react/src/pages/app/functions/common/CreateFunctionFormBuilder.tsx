import { Field, FormikProps } from 'formik';
import i18next from 'i18next';
import React from 'react';
import { Layout } from '../../../../components/form-controls/ReactiveFormControl';
import TextField from '../../../../components/form-controls/TextField';
import { ArmObj } from '../../../../models/arm-obj';
import { Binding } from '../../../../models/functions/binding';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { BindingEditorFormValues, BindingFormBuilder } from './BindingFormBuilder';

export interface CreateFunctionFormValues extends BindingEditorFormValues {
  functionName: string;
}

export class CreateFunctionFormBuilder extends BindingFormBuilder {
  constructor(
    bindingInfo: BindingInfo[],
    bindings: Binding[],
    resourceId: string,
    private _functionsInfo: ArmObj<FunctionInfo>[],
    private _defaultName: string,
    private t: i18next.TFunction
  ) {
    super(bindingInfo, bindings, resourceId, t);
  }

  public getInitialFormValues() {
    const functionNameValue = { functionName: this._getInitialFunctionName() };
    const bindingFormValues = super.getInitialFormValues();
    delete bindingFormValues.direction;
    delete bindingFormValues.type;
    return Object.assign({}, functionNameValue, bindingFormValues) as CreateFunctionFormValues;
  }

  public getFields(formProps: FormikProps<CreateFunctionFormValues>, isDisabled: boolean) {
    const nameField: JSX.Element[] = [this._getFunctionNameTextField(formProps, isDisabled)];
    const bindingFields: JSX.Element[] = super.getFields(formProps, isDisabled, false);
    return nameField.concat(bindingFields);
  }

  private _getInitialFunctionName(): string {
    let i = 1;
    while (true) {
      // eslint-disable-next-line no-loop-func
      const func = this._functionsInfo.find(value => {
        return `${this._defaultName.toLowerCase()}${i.toString()}` === value.properties.name.toLowerCase();
      });

      if (func) {
        i = i + 1;
      } else {
        return this._defaultName + i;
      }
    }
  }

  private _getFunctionNameTextField(formProps: FormikProps<CreateFunctionFormValues>, isDisabled: boolean) {
    return (
      <Field
        label={this.t('functionCreate_newFunction')}
        name={'functionName'}
        id={'functionName'}
        component={TextField}
        disabled={isDisabled}
        validate={(value: string) => this._validateFunctionName(value)}
        layout={Layout.Vertical}
        required={true}
        key={0}
        {...formProps}
        dirty={false}
      />
    );
  }

  private _validateFunctionName(name: string): string | undefined {
    let error: string | undefined;
    const validNameRegExp = new RegExp('^[a-zA-Z][a-zA-Z0-9_-]{0,127}$');

    if (!name) {
      error = this.t('fieldRequired');
    } else if (!validNameRegExp.test(name) || name.toLowerCase() === 'host') {
      error = this.t('functionNew_nameError');
    } else {
      const nameAlreadyUsed = this._functionsInfo.find(f => {
        return f.properties.name.toLowerCase() === name.toLowerCase();
      });
      if (nameAlreadyUsed) {
        error = this.t('functionNew_functionExists', { name });
      }
    }

    return error;
  }
}
