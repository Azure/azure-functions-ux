import React from 'react';
import { BindingFormBuilder } from './BindingFormBuilder';
import { CreateFunctionFormValues, getInitialFunctionName, getFunctionNameTextField } from './CreateFunctionFormBuilder';
import { ArmObj } from '../../../../models/arm-obj';
import { Binding, BindingSettingValue, BindingSetting, BindingValidator } from '../../../../models/functions/binding';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../models/functions/function-info';
import i18next from 'i18next';
import { Field, FormikProps } from 'formik';
import { IArmRscTemplate } from '../new-create-preview/FunctionCreateDataLoader';
import { Layout } from '../../../../components/form-controls/ReactiveFormControl';
import RadioButtonNoFormik from '../../../../components/form-controls/RadioButtonNoFormik';
import CosmosDBResourceDropdown from './CosmosDBResourceDropdown';

class CosmosDbFunctionFormBuilder extends BindingFormBuilder {
  constructor(
    bindingInfo: BindingInfo[],
    bindings: Binding[],
    resourceId: string,
    private _functionsInfo: ArmObj<FunctionInfo>[],
    private _defaultName: string,
    t: i18next.TFunction
  ) {
    super(bindingInfo, bindings, resourceId, t);

    this._modifyMetadata();
  }

  public getInitialFormValues() {
    const functionNameValue = { functionName: getInitialFunctionName(this._functionsInfo, this._defaultName) };
    const bindingFormValues = super.getInitialFormValues();
    delete bindingFormValues.direction;
    delete bindingFormValues.type;
    return Object.assign({}, functionNameValue, bindingFormValues) as CreateFunctionFormValues;
  }

  private _modifyMetadata() {
    // This functionality works on the assumption that the indices don't change (6/29/2021)
    if (this.bindingList && this.bindingList[0] && this.bindingList[0].settings) {
      // Modify existing fields
      this.bindingList[0].settings[0].label = 'Cosmos DB account';
      this.bindingList[0].settings[1].label = 'Database';
      this.bindingList[0].settings[2].label = 'Container';

      // Remove unneeded fields
      this.bindingList[0].settings.splice(3, 2);

      // Add new fields
      this.bindingList[0].settings.unshift({
        name: 'connectionType',
        value: BindingSettingValue.radioButtons,
        defaultValue: 'automatic',
        options: [
          {
            key: 'automatic',
            text: 'Automatic',
          },
          {
            key: 'manual',
            text: 'Manual',
          },
        ],
        required: true,
        label: 'Cosmos DB connection',
      });

      this.bindingList[0].settings.push({
        name: 'partitionKeyPath',
        value: BindingSettingValue.string,
        defaultValue: '/id',
        required: true,
        label: 'Partition key path',
        help:
          'The partition key is used to automatically distribute data across partitions for scalability. Choose a property in your JSON document that has a wide range of values and evenly distributes request volume. For small read-heavy workloads or write-heavy workloads of any size, id is often a good choice.',
      });
    }
  }

  public getFields(
    formProps: FormikProps<CreateFunctionFormValues>,
    setArmResources: (armResources: IArmRscTemplate[]) => void,
    isDisabled: boolean
  ) {
    const formFields: JSX.Element[] = [];

    const nameField: JSX.Element = getFunctionNameTextField(formProps, isDisabled, this._functionsInfo, this.t);
    formFields.push(nameField);

    const connectionTypeField = this._getRadioButtonField(this.bindingList[0].settings![0], formProps, isDisabled, this.t);
    formFields.push(connectionTypeField);

    const progressiveDisclosureElement = this._getProgressiveDisclosureFields(formProps, setArmResources);
    formFields.push(progressiveDisclosureElement);

    return formFields;
  }

  private _getRadioButtonField(
    setting: BindingSetting,
    formProps: FormikProps<CreateFunctionFormValues>,
    isDisabled: boolean,
    t: i18next.TFunction
  ) {
    return (
      <Field
        label={setting.label}
        name={setting.name}
        id={setting.name}
        component={RadioButtonNoFormik}
        disabled={isDisabled}
        defaultSelectedKey={setting.defaultValue}
        selectedKey={formProps.values[setting.name]}
        options={setting.options}
        onChange={(event, option) => formProps.setFieldValue(setting.name, option.key)}
        validate={value => this._validateRadioButton(value, setting.required)} // TODO: These'll have to be updated to the new validation method when that PR gets merged in
        onPanel={true}
        layout={Layout.Vertical} // TODO: Update this to horizontal when merging with horizontal form PR
        mouseOverToolTip={setting.help ? setting.help : undefined}
        key={setting.name}
        required={setting.required}
        {...formProps}
        dirty={false}
      />
    );
  }

  private _validateRadioButton(value: boolean, required: boolean): string | undefined {
    let error: string | undefined;
    if (required && value === undefined) {
      error = this.t('fieldRequired');
    }

    return error;
  }

  protected _getResourceField(
    setting: BindingSetting,
    formProps: FormikProps<CreateFunctionFormValues>,
    setArmResources: (armResources: IArmRscTemplate[]) => void,
    isDisabled: boolean,
    resourceId: string
  ) {
    return (
      <Field
        label={setting.label}
        name={setting.name}
        id={setting.name}
        component={CosmosDBResourceDropdown}
        setting={setting}
        resourceId={resourceId}
        disabled={isDisabled}
        validate={value => this._validateText(value, setting.required, setting.validators)} // TODO: These'll have to be updated to the new validation method when that PR gets merged in
        onPanel={true}
        layout={Layout.Vertical} // TODO: Update this to horizontal when merging with horizontal form PR
        mouseOverToolTip={setting.help ? setting.help : undefined}
        required={setting.required}
        key={setting.name}
        {...formProps}
        setArmResources={setArmResources}
        dirty={false}
      />
    );
  }

  private _getComboBoxField(
    setting: BindingSetting,
    formProps: FormikProps<CreateFunctionFormValues>,
    setArmResources: (armResources: IArmRscTemplate[]) => void,
    isDisabled: boolean,
    resourceId: string
  ) {
    return (
      <Field
        label={setting.label}
        name={setting.name}
        id={setting.name}
        component={CosmosDBComboBox}
        setting={setting}
        resourceId={resourceId}
        disabled={isDisabled}
        validate={value => this._validateComboBox(value, setting.required, setting.validators)} // TODO: These'll have to be updated to the new validation method when that PR gets merged in
        onPanel={true}
        layout={Layout.Vertical} // TODO: Update this to horizontal when merging with horizontal form PR
        mouseOverToolTip={setting.help ? setting.help : undefined}
        required={setting.required}
        key={setting.name}
        {...formProps}
        setArmResources={setArmResources}
        dirty={false}
      />
    );
  }

  private _validateComboBox(value: string, required: boolean, validators?: BindingValidator[]): string | undefined {
    let error: string | undefined;
    if (required && !value) {
      error = this.t('fieldRequired');
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

  // TODO: all 'isDisableds' set to false for now
  private _getProgressiveDisclosureFields(
    formProps: FormikProps<CreateFunctionFormValues>,
    setArmResources: (armResources: IArmRscTemplate[]) => void
  ) {
    return (
      <>
        {formProps.values.connectionType === 'automatic' && (
          <>
            {this._getResourceField(this.bindingList[0].settings![1], formProps, setArmResources, false, this._resourceId)}
            {formProps.values[this.bindingList[0].settings![1].name] &&
              this._getTextField(this.bindingList[0].settings![2], formProps, false)}
            {formProps.values[this.bindingList[0].settings![2].name] &&
              this._getTextField(this.bindingList[0].settings![3], formProps, false)}
            {formProps.values[this.bindingList[0].settings![3].name] &&
              this._getTextField(this.bindingList[0].settings![4], formProps, false)}
          </>
        )}

        {formProps.values.connectionType === 'manual' && (
          <>
            <h3>Custom app setting</h3>
            {this._getTextField(
              {
                name: 'customAppSettingKey',
                value: BindingSettingValue.string,
                defaultValue: '',
                required: true,
                label: 'Key',
                help: 'Enter the key/value pair for the Cosmos DB custom app setting.',
              },
              formProps,
              false
            )}
            {this._getTextField(
              {
                name: 'customAppSettingValue',
                value: BindingSettingValue.string,
                defaultValue: '',
                required: true,
                label: 'Value',
              },
              formProps,
              false
            )}

            <h3>Cosmos DB details</h3>
            {this._getTextField(this.bindingList[0].settings![2], formProps, false)}
            {this._getTextField(this.bindingList[0].settings![3], formProps, false)}
            {this._getTextField(this.bindingList[0].settings![4], formProps, false)}
          </>
        )}
      </>
    );
  }
}

export default CosmosDbFunctionFormBuilder;

// Placing this here for now just for ease of implementation (can be abstracted later if necessary)
const CosmosDBComboBox = () => {
  return <>{/* TODO */}</>;
};
