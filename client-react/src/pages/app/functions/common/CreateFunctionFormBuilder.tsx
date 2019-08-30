import React from 'react';
import { BindingConfigMetadata } from '../../../../models/functions/bindings-config';
import { BindingInfo } from '../../../../models/functions/function-binding';
import i18next from 'i18next';
import { BindingFormBuilder, BindingEditorFormValues } from './BindingFormBuilder';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { ArmObj } from '../../../../models/arm-obj';
import { FormikProps, Field } from 'formik';
import TextField from '../../../../components/form-controls/TextField';
import { Layout, FormControlWrapper } from '../../../../components/FormControlWrapper/FormControlWrapper';

export interface CreateFunctionFormValues extends BindingEditorFormValues {
  functionName: string;
}

export class CreateFunctionFormBuilder extends BindingFormBuilder {
  constructor(
    bindingInfo: BindingInfo,
    bindingMetadata: BindingConfigMetadata,
    resourceId: string,
    variables: { [key: string]: string },
    private _functionsInfo: ArmObj<FunctionInfo>[],
    private _defaultName: string,
    private t: i18next.TFunction
  ) {
    super(bindingInfo, bindingMetadata, resourceId, t, variables);
    console.log(variables);
  }

  public getInitialFormValues() {
    const functionNameValue = { functionName: this._getInitialFunctionName() };
    const bindingFormValues = super.getInitialFormValues();
    return Object.assign({}, functionNameValue, bindingFormValues) as CreateFunctionFormValues;
  }

  public getFields(formProps: FormikProps<CreateFunctionFormValues>, isDisabled: boolean) {
    const nameField: JSX.Element[] = [this._getFunctionNameTextField(formProps, isDisabled)];
    const bindingFields: JSX.Element[] = super.getFields(formProps, isDisabled, 1);
    return nameField.concat(bindingFields);
  }

  private _getInitialFunctionName(): string {
    let i = 1;
    while (true) {
      const func = this._functionsInfo.find(value => {
        return this._defaultName.toLowerCase() + i.toString() === value.properties.name.toLowerCase();
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
      <FormControlWrapper label={this.t('functionCreate_newFunction')} layout={Layout.vertical} key={0}>
        <Field name={'functionName'} component={TextField} disabled={isDisabled} {...formProps} />
      </FormControlWrapper>
    );
  }
}
