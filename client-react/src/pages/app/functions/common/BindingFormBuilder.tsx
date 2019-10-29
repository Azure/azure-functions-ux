import { Field, FormikProps } from 'formik';
import i18next from 'i18next';
import { IDropdownOption } from 'office-ui-fabric-react';
import React from 'react';
import Dropdown from '../../../../components/form-controls/DropDown';
import TextField from '../../../../components/form-controls/TextField';
import { FormControlWrapper, Layout } from '../../../../components/FormControlWrapper/FormControlWrapper';
import {
  BindingConfigDirection,
  BindingConfigMetadata,
  BindingConfigUIDefinition,
  BindingSettingValue,
} from '../../../../models/functions/bindings-config';
import { BindingInfo } from '../../../../models/functions/function-binding';
import HttpMethodMultiDropdown from './HttpMethodMultiDropdown';
import ResourceDropdown from './ResourceDropdown';
import Toggle from '../../../../components/form-controls/Toggle';

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
    private _bindingInfoList: BindingInfo[],
    private _bindingMetadataList: BindingConfigMetadata[],
    private _resourceId: string,
    private _t: i18next.TFunction,
    private _variables: { [key: string]: string }
  ) {}

  public getInitialFormValues(): BindingEditorFormValues {
    const initialFormValues: BindingEditorFormValues = {};

    let i = 0;
    for (const bindingMetadata of this._bindingMetadataList) {
      for (const setting of bindingMetadata.settings) {
        let value = this._bindingInfoList[i][setting.name];

        // If the stored value is empty, then make the assumption that everything is selected.
        // That's how it works for HTTP, so for now let's assume that's how it works for all checkBoxLists
        if (setting.value === BindingSettingValue.checkBoxList && !value) {
          value = setting.enum ? setting.enum.map(e => e.value) : [];
        }

        initialFormValues[setting.name] = value;
      }

      // Bindings metadata uses 'trigger' as a direction, but functions.json does not
      initialFormValues.direction = bindingMetadata.direction === BindingConfigDirection.trigger ? 'in' : bindingMetadata.direction;
      initialFormValues.type = bindingMetadata.type;
      i += 1;
    }
    return initialFormValues;
  }

  public getFields(formProps: FormikProps<BindingEditorFormValues>, isDisabled: boolean) {
    const fields: JSX.Element[] = [];

    let i = 0;
    for (const bindingMetadata of this._bindingMetadataList) {
      for (const setting of bindingMetadata.settings) {
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
            fields.push(this._getMultiSelectDropdown(setting, formProps, isDisabled));
            break;
          case BindingSettingValue.boolean:
            fields.push(this._getBooleanToggle(key, setting, formProps, isDisabled));
            break;
        }
      }
      i = +1;
    }

    return fields;
  }

  private _getTextField(setting: BindingConfigUIDefinition, formProps: FormikProps<BindingEditorFormValues>, isDisabled: boolean) {
    return (
      <FormControlWrapper
        label={BindingFormBuilder.getLocalizedString(setting.label, this._t, this._variables)}
        layout={Layout.vertical}
        tooltip={BindingFormBuilder.getLocalizedString(setting.help, this._t, this._variables)}
        key={setting.name}>
        <Field
          name={setting.name}
          id={setting.name}
          component={TextField}
          required={setting.required}
          disabled={isDisabled}
          {...formProps}
        />
      </FormControlWrapper>
    );
  }

  private _getDropdown(setting: BindingConfigUIDefinition, formProps: FormikProps<BindingEditorFormValues>, isDisabled: boolean) {
    let options: IDropdownOption[] = [];

    if (setting.enum) {
      options = setting.enum.map(e => ({ text: e.display, key: e.value }));
    }

    return (
      <FormControlWrapper
        label={BindingFormBuilder.getLocalizedString(setting.label, this._t, this._variables)}
        layout={Layout.vertical}
        tooltip={BindingFormBuilder.getLocalizedString(setting.help, this._t, this._variables)}
        key={setting.name}>
        <Field
          name={setting.name}
          id={setting.name}
          component={Dropdown}
          {...formProps}
          options={options}
          required={setting.required}
          disabled={isDisabled}
          {...formProps}
        />
      </FormControlWrapper>
    );
  }

  private _getBooleanToggle(
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
        <Field
          name={setting.name}
          component={Toggle}
          disabled={isDisabled}
          onText={this._t('yes')}
          offText={this._t('no')}
          {...formProps}
        />
      </FormControlWrapper>
    );
  }

  private _getResourceField(
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
        key={setting.name}>
        <Field
          name={setting.name}
          id={setting.name}
          component={ResourceDropdown}
          setting={setting}
          resourceId={resourceId}
          required={setting.required}
          disabled={isDisabled}
          {...formProps}
        />
      </FormControlWrapper>
    );
  }

  private _getMultiSelectDropdown(
    setting: BindingConfigUIDefinition,
    formProps: FormikProps<BindingEditorFormValues>,
    isDisabled: boolean,
    i: number
  ) {
    if (this._bindingInfoList[i].type.toLowerCase() === 'httptrigger') {
      return (
        <FormControlWrapper
          label={BindingFormBuilder.getLocalizedString(setting.label, this._t, this._variables)}
          layout={Layout.vertical}
          tooltip={BindingFormBuilder.getLocalizedString(setting.help, this._t, this._variables)}
          key={setting.name}>
          <Field
            name={setting.name}
            id={setting.name}
            component={HttpMethodMultiDropdown}
            setting={setting}
            required={setting.required}
            disabled={isDisabled}
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
        label={BindingFormBuilder.getLocalizedString(setting.label, this._t, this._variables)}
        layout={Layout.vertical}
        tooltip={BindingFormBuilder.getLocalizedString(setting.help, this._t, this._variables)}
        key={setting.name}>
        <Field
          name={setting.name}
          id={setting.name}
          component={Dropdown}
          {...formProps}
          options={options}
          required={setting.required}
          multiSelect
        />
      </FormControlWrapper>
    );
  }
}
