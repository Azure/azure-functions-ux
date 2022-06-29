import { IDropdownOption } from '@fluentui/react';
import { Field, FormikProps } from 'formik';
import i18next from 'i18next';
import Dropdown from '../../../../components/form-controls/DropDown';
import { Layout } from '../../../../components/form-controls/ReactiveFormControl';
import TextField from '../../../../components/form-controls/TextField';
import Toggle from '../../../../components/form-controls/Toggle';
import { Binding, BindingSetting, BindingSettingValue, BindingValidator } from '../../../../models/functions/binding';
import { BindingInfo, BindingType } from '../../../../models/functions/function-binding';
import { IArmResourceTemplate, TSetArmResourceTemplates } from '../../../../utils/ArmTemplateHelper';
import { BindingManager } from '../../../../utils/BindingManager';
import { getFunctionBindingDirection } from '../function/integrate/FunctionIntegrate.utils';
import { FunctionIntegrateConstants } from '../function/integrate/FunctionIntegrateConstants';
import { horizontalLabelStyle } from './BindingFormBuilder.styles';
import HttpMethodMultiDropdown from './HttpMethodMultiDropdown';
import ResourceDropdown from './ResourceDropdown';

export type BindingEditorFormValues = Record<string, any>;

export class BindingFormBuilder<TOptions> {
  public static getBindingTypeName = (currentBinding: BindingInfo, bindings: Binding[]): string | undefined => {
    return bindings.find(binding => BindingManager.isBindingTypeEqual(binding.type, currentBinding.type))?.displayName;
  };

  protected bindingList: Binding[];
  protected options?: TOptions;
  protected resourceId: string;
  protected t: i18next.TFunction;

  private _areCreateFunctionFieldsHorizontal: boolean;
  private _bindingInfoList: BindingInfo[];

  constructor(
    bindingInfoList: BindingInfo[],
    bindingList: Binding[],
    resourceId: string,
    t: i18next.TFunction,
    areCreateFunctionFieldsHorizontal: boolean,
    options?: TOptions
  ) {
    this.bindingList = bindingList;
    this.options = options;
    this.resourceId = resourceId;
    this.t = t;
    this._areCreateFunctionFieldsHorizontal = areCreateFunctionFieldsHorizontal;
    this._bindingInfoList = bindingInfoList;
  }

  public getInitialFormValues(): BindingEditorFormValues {
    const initialFormValues: BindingEditorFormValues = {};

    let i = 0;
    for (const binding of this.bindingList) {
      for (const setting of binding.settings ?? []) {
        let value = this._bindingInfoList[i][setting.name];

        // If the stored value is empty, then make the assumption that everything is selected.
        // That's how it works for HTTP, so for now let's assume that's how it works for all checkBoxLists
        if (setting.value === BindingSettingValue.checkBoxList && !value) {
          value = setting.enum?.map(e => e.value) ?? [];
        }

        // Ensure that value is set correctly when a case-insensitive match is found,
        // e.g., 'ANONYMOUS' authorization level should match 'anonymous' enum option value.
        if (setting.value === BindingSettingValue.enum && !!value) {
          const match = setting.enum?.find(
            option => value.localeCompare(option.value, /* locales */ undefined, { sensitivity: 'base' }) === 0
          )?.value;
          if (match) {
            value = match;
          }
        }

        initialFormValues[setting.name] = value;
      }

      initialFormValues.direction = getFunctionBindingDirection(binding.direction);
      initialFormValues.type = binding.type;
      i += 1;
    }

    return initialFormValues;
  }

  public getFields(
    formProps: FormikProps<BindingEditorFormValues>,
    isDisabled: boolean,
    includeRules: boolean,
    armResources?: IArmResourceTemplate[],
    setArmResources?: TSetArmResourceTemplates
  ) {
    const fields: JSX.Element[] = [];
    const ignoredFields: string[] = [];

    let i = 0;
    for (const binding of this.bindingList) {
      // We don't want to use the rule for HTTP as it doesn't offer the user anything
      // and we can't restore the state of the rule properly on a second load
      if (includeRules && formProps.values['type'] !== FunctionIntegrateConstants.httpType) {
        this._addRules(fields, ignoredFields, binding, formProps, isDisabled);
      }

      for (const setting of binding.settings || []) {
        if (!ignoredFields.includes(setting.name)) {
          this._addField(fields, setting, formProps, isDisabled, i, armResources, setArmResources);
        }
      }

      i += 1;
    }

    return fields;
  }

  private _addRules(
    fields: JSX.Element[],
    ignoredFields: string[],
    binding: Binding,
    formProps: FormikProps<BindingEditorFormValues>,
    isDisabled: boolean
  ) {
    if (binding.rules) {
      binding.rules.forEach(rule => {
        const ruleName = `${FunctionIntegrateConstants.rulePrefix}${rule.name}`;
        let defaultValue = formProps.values[ruleName] || rule.values[0].value;

        // No value yet, add a default, otherwise Formik will handle it
        if (!formProps.values[ruleName]) {
          for (const ruleValue of rule.values) {
            if (formProps.values[ruleValue.value]) {
              defaultValue = ruleValue.value;
              break;
            }
          }

          formProps.values[ruleName] = defaultValue;
        }

        const ruleInUse = rule.values.find(ruleValue => formProps.values[ruleName] === ruleValue.value);
        const hiddenSettings = (ruleInUse && ruleInUse.hiddenSettings) || [];
        ignoredFields.push(...hiddenSettings);
        ignoredFields.forEach(field => {
          delete formProps.values[field];
        });

        const ruleOptions = rule.values.map(ruleValue => {
          return {
            text: ruleValue.display,
            key: ruleValue.value,
          };
        });

        fields.push(
          <Field
            label={rule.label}
            name={ruleName}
            id={ruleName}
            component={Dropdown}
            options={ruleOptions}
            disabled={isDisabled}
            onPanel={true}
            layout={this._getFieldLayout()}
            mouseOverToolTip={rule.help}
            required={true}
            key={ruleName}
            {...formProps}
            dirty={false}
            customLabelClassName={this._getHorizontalLabelStyle()}
            customLabelStackClassName={this._getHorizontalLabelStyle()}
          />
        );
      });
    }
  }

  private _addField(
    fields: JSX.Element[],
    setting: BindingSetting,
    formProps: FormikProps<BindingEditorFormValues>,
    isDisabled: boolean,
    i: number,
    armResources?: IArmResourceTemplate[],
    setArmResources?: TSetArmResourceTemplates
  ) {
    switch (setting.value) {
      case BindingSettingValue.string:
        if (setting.resource) {
          fields.push(this.getResourceField(setting, formProps, isDisabled, this.resourceId, armResources, setArmResources));
        } else {
          fields.push(this.getTextField(setting, formProps, isDisabled));
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

  private _getFieldLayout() {
    return this._areCreateFunctionFieldsHorizontal ? Layout.Horizontal : Layout.Vertical;
  }

  private _getHorizontalLabelStyle() {
    return this._getFieldLayout() === Layout.Horizontal ? horizontalLabelStyle : undefined;
  }

  protected getTextField(setting: BindingSetting, formProps: FormikProps<BindingEditorFormValues>, disabled: boolean) {
    return (
      <Field
        label={setting.label}
        name={setting.name}
        id={setting.name}
        component={TextField}
        disabled={disabled}
        validate={value => this.validateText(value, setting.required, setting.validators)}
        layout={this._getFieldLayout()}
        mouseOverToolTip={setting.help}
        required={setting.required}
        key={setting.name}
        {...formProps}
        dirty={false}
        customLabelClassName={this._getHorizontalLabelStyle()}
        customLabelStackClassName={this._getHorizontalLabelStyle()}
      />
    );
  }

  private _getDropdown(setting: BindingSetting, formProps: FormikProps<BindingEditorFormValues>, isDisabled: boolean) {
    let options: IDropdownOption[] = [];

    if (setting.enum) {
      options = setting.enum.map(e => ({ text: e.display, key: e.value }));
    }

    if (!setting.required) {
      options.unshift({ text: '', key: '' });
    }

    return (
      <Field
        label={setting.label}
        name={setting.name}
        id={setting.name}
        component={Dropdown}
        options={options}
        disabled={isDisabled}
        validate={value => this.validateText(value, setting.required, setting.validators)}
        onPanel={true}
        layout={this._getFieldLayout()}
        mouseOverToolTip={setting.help}
        required={setting.required}
        key={setting.name}
        {...formProps}
        dirty={false}
        customLabelClassName={this._getHorizontalLabelStyle()}
        customLabelStackClassName={this._getHorizontalLabelStyle()}
      />
    );
  }

  private _getBooleanToggle(setting: BindingSetting, formProps: FormikProps<BindingEditorFormValues>, isDisabled: boolean) {
    return (
      <Field
        label={setting.label}
        name={setting.name}
        id={setting.name}
        component={Toggle}
        disabled={isDisabled}
        onText={this.t('yes')}
        offText={this.t('no')}
        validate={(value: boolean) => this._validateBoolean(value, setting.required)}
        layout={this._getFieldLayout()}
        mouseOverToolTip={setting.help}
        required={setting.required}
        key={setting.name}
        {...formProps}
        dirty={false}
        customLabelClassName={this._getHorizontalLabelStyle()}
        customLabelStackClassName={this._getHorizontalLabelStyle()}
      />
    );
  }

  protected getResourceField(
    setting: BindingSetting,
    formProps: FormikProps<BindingEditorFormValues>,
    disabled: boolean,
    resourceId: string,
    armResources?: IArmResourceTemplate[],
    setArmResources?: TSetArmResourceTemplates
  ) {
    return (
      <Field
        label={setting.label}
        name={setting.name}
        id={setting.name}
        component={ResourceDropdown}
        setting={setting}
        resourceId={resourceId}
        disabled={disabled}
        validate={value => this.validateText(value, setting.required, setting.validators)}
        onPanel={true}
        layout={this._getFieldLayout()}
        mouseOverToolTip={setting.help}
        required={setting.required}
        key={setting.name}
        {...formProps}
        dirty={false}
        customLabelClassName={this._getHorizontalLabelStyle()}
        customLabelStackClassName={this._getHorizontalLabelStyle()}
        armResources={armResources}
        setArmResources={setArmResources}
      />
    );
  }

  private _getMultiSelectDropdown(
    setting: BindingSetting,
    formProps: FormikProps<BindingEditorFormValues>,
    isDisabled: boolean,
    i: number
  ) {
    if (BindingManager.isBindingTypeEqual(this._bindingInfoList[i].type, BindingType.httpTrigger)) {
      return (
        <Field
          label={setting.label}
          name={setting.name}
          id={setting.name}
          component={HttpMethodMultiDropdown}
          setting={setting}
          disabled={isDisabled}
          validate={value => this.validateText(value, setting.required, setting.validators)}
          onPanel={true}
          layout={this._getFieldLayout()}
          mouseOverToolTip={setting.help}
          required={setting.required}
          key={setting.name}
          {...formProps}
          dirty={false}
          customLabelClassName={this._getHorizontalLabelStyle()}
          customLabelStackClassName={this._getHorizontalLabelStyle()}
        />
      );
    }

    let options: IDropdownOption[] = [];

    if (setting.enum) {
      options = setting.enum.map(e => ({ text: e.display, key: e.value }));
    }

    return (
      <Field
        label={setting.label}
        name={setting.name}
        id={setting.name}
        component={Dropdown}
        options={options}
        multiSelect
        disabled={isDisabled}
        validate={value => this.validateText(value, setting.required, setting.validators)}
        onPanel={true}
        layout={this._getFieldLayout()}
        mouseOverToolTip={setting.help}
        required={setting.required}
        key={setting.name}
        {...formProps}
        dirty={false}
        customLabelClassName={this._getHorizontalLabelStyle()}
        customLabelStackClassName={this._getHorizontalLabelStyle()}
      />
    );
  }

  protected validateText(value: string, required: boolean, validators: BindingValidator[] = []): string | undefined {
    let error: string | undefined;
    if (required && !value) {
      error = this.t('fieldRequired');
    }

    if (value) {
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
      error = this.t('fieldRequired');
    }

    return error;
  }
}
