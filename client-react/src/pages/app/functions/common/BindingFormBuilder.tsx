import { Field, FormikProps } from 'formik';
import i18next from 'i18next';
import { IDropdownOption } from 'office-ui-fabric-react';
import React from 'react';
import Dropdown from '../../../../components/form-controls/DropDown';
import TextField from '../../../../components/form-controls/TextField';
import { FormControlWrapper, Layout } from '../../../../components/FormControlWrapper/FormControlWrapper';
import { Binding, BindingSetting, BindingSettingValue, BindingValidator } from '../../../../models/functions/binding';
import { BindingInfo, BindingType } from '../../../../models/functions/function-binding';
import HttpMethodMultiDropdown from './HttpMethodMultiDropdown';
import ResourceDropdown from './ResourceDropdown';
import Toggle from '../../../../components/form-controls/Toggle';
import { getFunctionBindingDirection } from '../function/integrate/BindingPanel/BindingEditor';

export interface BindingEditorFormValues {
  [key: string]: any;
}

export class BindingFormBuilder {
  public static getBindingTypeName = (currentBinding: BindingInfo, bindings: Binding[]): string => {
    return (bindings.find(binding => binding.type === currentBinding.type) as Binding).displayName;
  };

  constructor(
    private _bindingInfoList: BindingInfo[],
    private _bindingList: Binding[],
    private _resourceId: string,
    private _t: i18next.TFunction
  ) {}

  public getInitialFormValues(): BindingEditorFormValues {
    const initialFormValues: BindingEditorFormValues = {};

    let i = 0;
    for (const binding of this._bindingList) {
      for (const setting of binding.settings || []) {
        let value = this._bindingInfoList[i][setting.name];

        // If the stored value is empty, then make the assumption that everything is selected.
        // That's how it works for HTTP, so for now let's assume that's how it works for all checkBoxLists
        if (setting.value === BindingSettingValue.checkBoxList && !value) {
          value = setting.enum ? setting.enum.map(e => e.value) : [];
        }

        initialFormValues[setting.name] = value;
      }

      initialFormValues.direction = getFunctionBindingDirection(binding.direction);
      initialFormValues.type = binding.type;
      i += 1;
    }
    return initialFormValues;
  }

  public getFields(formProps: FormikProps<BindingEditorFormValues>, isDisabled: boolean) {
    const fields: JSX.Element[] = [];

    let i = 0;
    for (const binding of this._bindingList) {
      for (const setting of binding.settings || []) {
        switch (setting.value) {
          case BindingSettingValue.string:
            if (setting.resource) {
              fields.push(this._getResourceField(setting, formProps, isDisabled, this._resourceId));
            } else {
              fields.push(this._getTextField(setting, formProps, isDisabled));
            }
            break;
          case BindingSettingValue.enum:
            fields.push(this._getDropdown(setting, formProps, isDisabled));
            break;
          case BindingSettingValue.checkBoxList:
            fields.push(this._getMultiSelectDropdown(setting, formProps, isDisabled, i));
            break;
          case BindingSettingValue.boolean:
            fields.push(this._getBooleanToggle(setting, formProps, isDisabled));
            break;
        }
      }
      i = +1;
    }

    return fields;
  }

  private _getTextField(setting: BindingSetting, formProps: FormikProps<BindingEditorFormValues>, isDisabled: boolean) {
    return (
      <FormControlWrapper
        label={setting.label}
        layout={Layout.vertical}
        tooltip={setting.help}
        required={setting.required}
        key={setting.name}>
        <Field
          name={setting.name}
          id={setting.name}
          component={TextField}
          disabled={isDisabled}
          validate={value => this._validateText(value, setting.required, setting.validators)}
          {...formProps}
        />
      </FormControlWrapper>
    );
  }

  private _getDropdown(setting: BindingSetting, formProps: FormikProps<BindingEditorFormValues>, isDisabled: boolean) {
    let options: IDropdownOption[] = [];

    if (setting.enum) {
      options = setting.enum.map(e => ({ text: e.display, key: e.value }));
    }

    return (
      <FormControlWrapper
        label={setting.label}
        layout={Layout.vertical}
        tooltip={setting.help}
        required={setting.required}
        key={setting.name}>
        <Field
          name={setting.name}
          id={setting.name}
          component={Dropdown}
          options={options}
          disabled={isDisabled}
          validate={value => this._validateText(value, setting.required, setting.validators)}
          onPanel={true}
          {...formProps}
        />
      </FormControlWrapper>
    );
  }

  private _getBooleanToggle(setting: BindingSetting, formProps: FormikProps<BindingEditorFormValues>, isDisabled: boolean) {
    return (
      <FormControlWrapper
        label={setting.label}
        layout={Layout.vertical}
        tooltip={setting.help}
        required={setting.required}
        key={setting.name}>
        <Field
          name={setting.name}
          id={setting.name}
          component={Toggle}
          disabled={isDisabled}
          onText={this._t('yes')}
          offText={this._t('no')}
          validate={(value: boolean) => this._validateBoolean(value, setting.required)}
          {...formProps}
        />
      </FormControlWrapper>
    );
  }

  private _getResourceField(
    setting: BindingSetting,
    formProps: FormikProps<BindingEditorFormValues>,
    isDisabled: boolean,
    resourceId: string
  ) {
    return (
      <FormControlWrapper
        label={setting.label}
        layout={Layout.vertical}
        tooltip={setting.help}
        required={setting.required}
        key={setting.name}>
        <Field
          name={setting.name}
          id={setting.name}
          component={ResourceDropdown}
          setting={setting}
          resourceId={resourceId}
          disabled={isDisabled}
          validate={value => this._validateText(value, setting.required, setting.validators)}
          onPanel={true}
          {...formProps}
        />
      </FormControlWrapper>
    );
  }

  private _getMultiSelectDropdown(
    setting: BindingSetting,
    formProps: FormikProps<BindingEditorFormValues>,
    isDisabled: boolean,
    i: number
  ) {
    if (this._bindingInfoList[i].type === BindingType.httpTrigger) {
      return (
        <FormControlWrapper
          label={setting.label}
          layout={Layout.vertical}
          tooltip={setting.help}
          required={setting.required}
          key={setting.name}>
          <Field
            name={setting.name}
            id={setting.name}
            component={HttpMethodMultiDropdown}
            setting={setting}
            disabled={isDisabled}
            validate={value => this._validateText(value, setting.required, setting.validators)}
            onPanel={true}
            {...formProps}
          />
        </FormControlWrapper>
      );
    }

    let options: IDropdownOption[] = [];

    if (setting.enum) {
      options = setting.enum.map(e => ({ text: e.display, key: e.value }));
    }

    return (
      <FormControlWrapper
        label={setting.label}
        layout={Layout.vertical}
        tooltip={setting.help}
        required={setting.required}
        key={setting.name}>
        <Field
          name={setting.name}
          id={setting.name}
          component={Dropdown}
          options={options}
          multiSelect
          disabled={isDisabled}
          validate={value => this._validateText(value, setting.required, setting.validators)}
          onPanel={true}
          {...formProps}
        />
      </FormControlWrapper>
    );
  }

  private _validateText(value: string, required: boolean, validators?: BindingValidator[]): string | undefined {
    let error: string | undefined;
    if (required && !value) {
      error = this._t('fieldRequired');
    }

    if (value && validators) {
      validators.forEach(validator => {
        if (!value.match(validator.expression)) {
          error = validator.errorText;
        }
      });
    }

    return error;
  }

  private _validateBoolean(value: boolean, required: boolean): string | undefined {
    let error: string | undefined;
    if (required && value === undefined) {
      error = this._t('fieldRequired');
    }

    return error;
  }
}
