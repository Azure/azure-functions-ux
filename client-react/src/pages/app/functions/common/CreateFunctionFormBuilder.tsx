import { Field, FormikProps } from 'formik';
import i18next from 'i18next';
import React from 'react';
import { Layout } from '../../../../components/form-controls/ReactiveFormControl';
import TextField from '../../../../components/form-controls/TextField';
import { ArmObj } from '../../../../models/arm-obj';
import { Binding } from '../../../../models/functions/binding';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { IArmRscTemplate } from '../new-create-preview/FunctionCreateDataLoader';
import { BindingEditorFormValues, BindingFormBuilder } from './BindingFormBuilder';

export interface CreateFunctionFormValues extends BindingEditorFormValues {
  functionName: string;
}

export const getInitialFunctionName = (functionsInfo: ArmObj<FunctionInfo>[], defaultName: string): string => {
  let i = 1;
  while (true) {
    // eslint-disable-next-line no-loop-func
    const func = functionsInfo.find(value => {
      return `${defaultName.toLowerCase()}${i.toString()}` === value.properties.name.toLowerCase();
    });

    if (func) {
      i = i + 1;
    } else {
      return defaultName + i;
    }
  }
};

export const getFunctionNameTextField = (
  formProps: FormikProps<CreateFunctionFormValues>,
  isDisabled: boolean,
  functionsInfo: ArmObj<FunctionInfo>[],
  t: i18next.TFunction
) => {
  const validateFunctionName = (name: string): string | undefined => {
    let error: string | undefined;
    const validNameRegExp = new RegExp('^[a-zA-Z][a-zA-Z0-9_-]{0,127}$');

    if (!name) {
      error = t('fieldRequired');
    } else if (!validNameRegExp.test(name) || name.toLowerCase() === 'host') {
      error = t('functionNew_nameError');
    } else {
      const nameAlreadyUsed = functionsInfo.find(f => {
        return f.properties.name.toLowerCase() === name.toLowerCase();
      });
      if (nameAlreadyUsed) {
        error = t('functionNew_functionExists', { name });
      }
    }

    return error;
  };

  return (
    <Field
      label={t('functionCreate_newFunction')}
      name={'functionName'}
      id={'functionName'}
      component={TextField}
      disabled={isDisabled}
      validate={(value: string) => validateFunctionName(value)}
      layout={Layout.Vertical}
      required={true}
      key={0}
      {...formProps}
      dirty={false}
    />
  );
};

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
    const functionNameValue = { functionName: getInitialFunctionName(this._functionsInfo, this._defaultName) };
    const bindingFormValues = super.getInitialFormValues();
    delete bindingFormValues.direction;
    delete bindingFormValues.type;
    return Object.assign({}, functionNameValue, bindingFormValues) as CreateFunctionFormValues;
  }

  public getFields(
    formProps: FormikProps<CreateFunctionFormValues>,
    setArmResources: (armResources: IArmRscTemplate[]) => void,
    isDisabled: boolean
  ) {
    const nameField: JSX.Element[] = [getFunctionNameTextField(formProps, isDisabled, this._functionsInfo, this.t)];
    const bindingFields: JSX.Element[] = super.getFields(formProps, setArmResources, isDisabled, false);
    return nameField.concat(bindingFields);
  }
}
