import React from 'react';
import {
  BindingConfigMetadata,
  BindingConfigUIDefinition,
  BindingConfigDirection,
  BindingSettingValue,
} from '../../../../models/functions/bindings-config';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { FormControlWrapper, Layout } from '../../../../components/FormControlWrapper/FormControlWrapper';
import i18next from 'i18next';
import { FormikProps, Field } from 'formik';
import TextField from '../../../../components/form-controls/TextField';
import Dropdown from '../../../../components/form-controls/DropDown';
import { IDropdownOption } from 'office-ui-fabric-react';
import HttpMethodMultiDropdown from './HttpMethodMultiDropdown';
import ResourceDropdown from './ResourceDropdown';

export interface BindingEditorFormValues {
  [key: string]: any;
}

export class BindingFormBuilder {
  public static getLocalizedString(s: string, t: i18next.TFunction, variables: { [key: string]: string }) {
    let result = s;
    if (s.startsWith('$')) {
      result = result.substring(1, result.length);
    } else if (s.startsWith('[variables(')) {
      // Temporary logic to grab string from variables, which will be removed with ANT86 APIs
      for (const key in variables) {
        if (variables.hasOwnProperty(key)) {
          result = result.replace(`[variables('${key}')]`, variables[key]);
        }
      }
      result = result.substring(1, result.length);
    }

    return t(result);
  }

  constructor(
    private _bindingInfo: BindingInfo,
    private _bindingMetadata: BindingConfigMetadata,
    private _resourceId: string,
    private _t: i18next.TFunction,
    private _variables: { [key: string]: string }
  ) {}

  public getInitialFormValues() {
    const initialFormValues: BindingEditorFormValues = {};

    for (const setting of this._bindingMetadata.settings) {
      let value = this._bindingInfo[setting.name];

      // If the stored value is empty, then make the assumption that everything is selected.
      // That's how it works for HTTP, so for now let's assume that's how it works for all checkBoxLists
      if (setting.value === BindingSettingValue.checkBoxList && !value) {
        value = setting.enum ? setting.enum.map(e => e.value) : [];
      }

      initialFormValues[setting.name] = value;
    }

    // Bindings metadata uses 'trigger' as a direction, but functions.json does not
    initialFormValues.direction =
      this._bindingMetadata.direction === BindingConfigDirection.trigger ? 'in' : this._bindingMetadata.direction;
    initialFormValues.type = this._bindingMetadata.type;

    return initialFormValues;
  }

  public getFields(formProps: FormikProps<BindingEditorFormValues>, isDisabled: boolean, keyOffset = 0) {
    const fields: JSX.Element[] = [];

    let key = keyOffset;
    for (const setting of this._bindingMetadata.settings) {
      switch (setting.value) {
        case BindingSettingValue.string:
          if (setting.resource) {
            fields.push(this._getResourceField(key, setting, formProps, isDisabled, this._resourceId));
          } else {
            fields.push(this._getTextField(key, setting, formProps, isDisabled));
          }
          break;
        case BindingSettingValue.enum:
          fields.push(this._getDropdown(key, setting, formProps, isDisabled));
          break;
        case BindingSettingValue.checkBoxList:
          fields.push(this._getMultiSelectDropdown(key, setting, formProps, isDisabled));
          break;
      }

      key = key + 1;
    }

    return fields;
  }

  private _getTextField(
    key: number,
    setting: BindingConfigUIDefinition,
    formProps: FormikProps<BindingEditorFormValues>,
    isDisabled: boolean
  ) {
    return (
      <FormControlWrapper
        label={BindingFormBuilder.getLocalizedString(setting.label, this._t, this._variables)}
        layout={Layout.vertical}
        tooltip={BindingFormBuilder.getLocalizedString(setting.help, this._t, this._variables)}
        key={key}>
        <Field name={setting.name} component={TextField} disabled={isDisabled} {...formProps} />
      </FormControlWrapper>
    );
  }

  private _getDropdown(
    key: number,
    setting: BindingConfigUIDefinition,
    formProps: FormikProps<BindingEditorFormValues>,
    isDisabled: boolean
  ) {
    let options: IDropdownOption[] = [];

    if (setting.enum) {
      options = setting.enum.map(e => ({ text: e.display, key: e.value }));
    }

    return (
      <FormControlWrapper
        label={BindingFormBuilder.getLocalizedString(setting.label, this._t, this._variables)}
        layout={Layout.vertical}
        tooltip={BindingFormBuilder.getLocalizedString(setting.help, this._t, this._variables)}
        key={key}>
        <Field name={setting.name} component={Dropdown} {...formProps} options={options} disabled={isDisabled} />
      </FormControlWrapper>
    );
  }

  private _getResourceField(
    key: number,
    setting: BindingConfigUIDefinition,
    formProps: FormikProps<BindingEditorFormValues>,
    isDisabled: boolean,
    resourceId: string
  ) {
    return (
      <FormControlWrapper
        label={BindingFormBuilder.getLocalizedString(setting.label, this._t, this._variables)}
        layout={Layout.vertical}
        tooltip={BindingFormBuilder.getLocalizedString(setting.help, this._t, this._variables)}
        key={key}>
        <Field
          name={setting.name}
          component={ResourceDropdown}
          key={key}
          setting={setting}
          resourceId={resourceId}
          disabled={isDisabled}
          {...formProps}
        />
      </FormControlWrapper>
    );
  }

  private _getMultiSelectDropdown(
    key: number,
    setting: BindingConfigUIDefinition,
    formProps: FormikProps<BindingEditorFormValues>,
    isDisabled: boolean
  ) {
    if (this._bindingInfo.type.toLowerCase() === 'httptrigger') {
      return (
        <FormControlWrapper
          label={BindingFormBuilder.getLocalizedString(setting.label, this._t, this._variables)}
          layout={Layout.vertical}
          tooltip={BindingFormBuilder.getLocalizedString(setting.help, this._t, this._variables)}
          key={key}>
          <Field name={setting.name} component={HttpMethodMultiDropdown} key={key} setting={setting} disabled={isDisabled} {...formProps} />
        </FormControlWrapper>
      );
    }

    let options: IDropdownOption[] = [];

    if (setting.enum) {
      options = setting.enum.map(e => ({ text: e.display, key: e.value }));
    }

    return (
      <FormControlWrapper
        label={BindingFormBuilder.getLocalizedString(setting.label, this._t, this._variables)}
        layout={Layout.vertical}
        tooltip={BindingFormBuilder.getLocalizedString(setting.help, this._t, this._variables)}
        key={key}>
        <Field name={setting.name} component={Dropdown} {...formProps} options={options} multiSelect />
      </FormControlWrapper>
    );
  }
}
