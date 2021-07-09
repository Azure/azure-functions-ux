import React from 'react';
import { BindingFormBuilder } from './BindingFormBuilder';
import { CreateFunctionFormValues, getInitialFunctionName, getFunctionNameTextField } from './CreateFunctionFormBuilder';
import { ArmObj } from '../../../../models/arm-obj';
import { Binding, BindingSettingValue, BindingSetting, BindingValidator } from '../../../../models/functions/binding';
import { BindingInfo, BindingType } from '../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../models/functions/function-info';
import i18next from 'i18next';
import { Field, FormikProps } from 'formik';
import { IArmRscTemplate } from '../new-create-preview/FunctionCreateDataLoader';
import { Layout } from '../../../../components/form-controls/ReactiveFormControl';
import RadioButtonNoFormik from '../../../../components/form-controls/RadioButtonNoFormik';
import CosmosDBResourceDropdown from './CosmosDBResourceDropdown';
import CosmosDBComboBox from './CosmosDBComboBox';
import { CommonConstants } from '../../../../utils/CommonConstants';

class CosmosDbFunctionFormBuilder extends BindingFormBuilder {
  private _metadataHasBeenUpdated: boolean;

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
    if (!this._metadataHasBeenUpdated) return {} as CreateFunctionFormValues;

    const functionNameValue = { functionName: getInitialFunctionName(this._functionsInfo, this._defaultName) };
    const bindingFormValues = super.getInitialFormValues();
    delete bindingFormValues.direction;
    delete bindingFormValues.type;

    bindingFormValues.connectionType = 'automatic';
    bindingFormValues.partitionKeyPath = CommonConstants.CosmosDbDefaults.partitionKeyPath;

    return Object.assign({}, functionNameValue, bindingFormValues) as CreateFunctionFormValues;
  }

  private _modifyMetadata() {
    // This functionality works on the assumption that the indices don't change (6/29/2021)
    if (
      this.bindingList &&
      this.bindingList[0] &&
      this.bindingList[0].settings &&
      this.bindingList[0].type === BindingType.cosmosDBTrigger
    ) {
      // Modify existing fields
      this.bindingList[0].settings[0].label = this.t('cosmosDbAccount');
      delete this.bindingList[0].settings[0].help;

      this.bindingList[0].settings[1].label = this.t('database');
      this.bindingList[0].settings[1].validators = [
        {
          expression: '^[^/\\\\#?]+$',
          errorText: this.t('databaseNameCharacters'),
        },
        {
          expression: '[^\\s]+$',
          errorText: this.t('databaseNameSpace'),
        },
      ];

      this.bindingList[0].settings[2].label = this.t('container');
      this.bindingList[0].settings[2].validators = [
        {
          expression: '^[^/\\\\#?]+$',
          errorText: this.t('containerNameCharacters'),
        },
        {
          expression: '[^\\s]+$',
          errorText: this.t('containerNameSpace'),
        },
      ];

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
        label: this.t('cosmosDbConnection'),
      });

      this.bindingList[0].settings.push({
        name: 'partitionKeyPath',
        value: BindingSettingValue.string,
        defaultValue: CommonConstants.CosmosDbDefaults.partitionKeyPath,
        required: true,
        label: 'Partition key path',
        validators: [
          {
            expression: '^[/].*',
            errorText: this.t('partitionKeyPathSlash'),
          },
        ],
        help: this.t('partitionKeyPathHelp'),
      });

      this._metadataHasBeenUpdated = true;
    }
  }

  public getFields(
    formProps: FormikProps<CreateFunctionFormValues>,
    setArmResources: (armResources: IArmRscTemplate[]) => void,
    armResources: IArmRscTemplate[],
    isDisabled: boolean
  ) {
    if (!this._metadataHasBeenUpdated) return [];

    const formFields: JSX.Element[] = [];

    const nameField: JSX.Element = getFunctionNameTextField(formProps, isDisabled, this._functionsInfo, this.t);
    formFields.push(nameField);

    const connectionTypeField = this._getRadioButtonField(this.bindingList[0].settings![0], formProps, isDisabled, this.t);
    formFields.push(connectionTypeField);

    const progressiveDisclosureElement = this._getProgressiveDisclosureFields(formProps, setArmResources, armResources, isDisabled);
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
    armResources: IArmRscTemplate[],
    isDisabled: boolean,
    resourceId: string
  ) {
    // TODO: make sure the styles are updated for the (resource) dropdown here in-line with the onload-validation-errors PR style update (AB#10184885)
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
        armResources={armResources}
        dirty={false}
      />
    );
  }

  private _getComboBoxField(
    setting: BindingSetting,
    formProps: FormikProps<CreateFunctionFormValues>,
    setArmResources: (armResources: IArmRscTemplate[]) => void,
    armResources: IArmRscTemplate[],
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
        armResources={armResources}
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

  private _getProgressiveDisclosureFields(
    formProps: FormikProps<CreateFunctionFormValues>,
    setArmResources: (armResources: IArmRscTemplate[]) => void,
    armResources: IArmRscTemplate[],
    isDisabled: boolean
  ) {
    return (
      <React.Fragment key="pdFields">
        {formProps.values.connectionType === 'automatic' && (
          <React.Fragment key="automaticCdbTemplate">
            {this._getResourceField(
              this.bindingList[0].settings![1],
              formProps,
              setArmResources,
              armResources,
              isDisabled,
              this._resourceId
            )}
            {formProps.values[this.bindingList[0].settings![1].name] &&
              this._getComboBoxField(
                this.bindingList[0].settings![2],
                formProps,
                setArmResources,
                armResources,
                isDisabled,
                this._resourceId
              )}
            {formProps.values[this.bindingList[0].settings![2].name] &&
              this._getComboBoxField(
                this.bindingList[0].settings![3],
                formProps,
                setArmResources,
                armResources,
                isDisabled,
                this._resourceId
              )}
            {formProps.status &&
              formProps.status.isNewContainer &&
              formProps.status.dbAcctType !== CommonConstants.CosmosDbTypes.mongoDb &&
              this._getTextField(this.bindingList[0].settings![4], formProps, isDisabled)}
          </React.Fragment>
        )}

        {formProps.values.connectionType === 'manual' && (
          <React.Fragment key="manualCdbTemplate">
            <h3>Custom app setting</h3>
            {this._getTextField(
              {
                name: 'customAppSettingKey',
                value: BindingSettingValue.string,
                defaultValue: '',
                required: true,
                label: this.t('key'),
                help: this.t('cosmosDb_customAppSettingKeyHelp'),
              },
              formProps,
              isDisabled
            )}
            {this._getTextField(
              {
                name: 'customAppSettingValue',
                value: BindingSettingValue.string,
                defaultValue: '',
                required: true,
                label: this.t('value'),
              },
              formProps,
              isDisabled
            )}

            <h3>Cosmos DB details</h3>
            {this._getTextField(this.bindingList[0].settings![2], formProps, isDisabled)}
            {this._getTextField(this.bindingList[0].settings![3], formProps, isDisabled)}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

export default CosmosDbFunctionFormBuilder;
