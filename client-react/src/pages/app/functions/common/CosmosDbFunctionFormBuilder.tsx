import { MessageBar, MessageBarType } from '@fluentui/react';
import { Field, FormikProps } from 'formik';
import i18next from 'i18next';
import RadioButtonNoFormik from '../../../../components/form-controls/RadioButtonNoFormik';
import { Layout } from '../../../../components/form-controls/ReactiveFormControl';
import { ArmObj } from '../../../../models/arm-obj';
import { Binding, BindingSetting, BindingSettingValue, BindingValidator } from '../../../../models/functions/binding';
import { BindingInfo, BindingType } from '../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { IArmResourceTemplate, TSetArmResourceTemplates } from '../../../../utils/ArmTemplateHelper';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { ValidationRegex } from '../../../../utils/constants/ValidationRegex';
import { horizontalLabelStyle } from './BindingFormBuilder.styles';
import CosmosDbContainerComboBox from './combobox-with-link/cosmos-db/CosmosDbContainerComboBox';
import CosmosDbDatabaseComboBox from './combobox-with-link/cosmos-db/CosmosDbDatabaseComboBox';
import { messageBarStyles } from './CosmosDbFunctionFormBuilder.styles';
import CosmosDbResourceDropdown from './CosmosDbResourceDropdown';
import { CreateFunctionFormBuilder, CreateFunctionFormValues } from './CreateFunctionFormBuilder';

interface CreateCosmosDbFunctionFormBuilderOptions {
  hasResourceGroupWritePermission: boolean;
  hasSubscriptionWritePermission: boolean;
}

const beginsWithSlash = '^[/].*';

enum SettingNames {
  collectionName = 'collectionName',
  databaseName = 'databaseName',
}

enum ConnectionType {
  automatic = 'automatic',
  manual = 'manual',
}

class CosmosDbFunctionFormBuilder extends CreateFunctionFormBuilder<CreateCosmosDbFunctionFormBuilderOptions> {
  private _metadataHasBeenUpdated: boolean;

  constructor(
    bindingInfo: BindingInfo[],
    bindings: Binding[],
    resourceId: string,
    functionsInfo: ArmObj<FunctionInfo>[],
    defaultName: string,
    t: i18next.TFunction,
    options: CreateCosmosDbFunctionFormBuilderOptions
  ) {
    super(bindingInfo, bindings, resourceId, functionsInfo, defaultName, t, options);

    this._modifyMetadata();
  }

  public getFields(
    formProps: FormikProps<CreateFunctionFormValues>,
    disabled: boolean,
    _includeRules: boolean,
    armResources: IArmResourceTemplate[],
    setArmResources: TSetArmResourceTemplates
  ) {
    if (!this._metadataHasBeenUpdated || !this.bindingList[0].settings?.[0]) {
      return [];
    }

    const formFields: JSX.Element[] = [
      this.getFunctionNameTextField(formProps, disabled),
      this._getRadioButtonField(this.bindingList[0].settings[0], formProps, disabled),
    ];

    if (!(this.options?.hasSubscriptionWritePermission && this.options?.hasSubscriptionWritePermission)) {
      formFields.push(
        <MessageBar messageBarType={MessageBarType.warning} styles={messageBarStyles}>
          {this.t('cosmosDb_error_writePermissionsRequired')}
        </MessageBar>
      );
    }

    formFields.push(this._getProgressiveDisclosureFields(formProps, disabled, armResources, setArmResources));

    return formFields;
  }

  public getInitialFormValues(): CreateFunctionFormValues {
    const functionNameValue = { functionName: this.getInitialFunctionName() };
    if (!this._metadataHasBeenUpdated) {
      return {
        ...functionNameValue,
      };
    }

    const { direction, type, ...bindingFormValues } = super.getInitialFormValues();
    bindingFormValues.connectionType = !this._hasWritePermissions() ? ConnectionType.manual : ConnectionType.automatic;
    bindingFormValues.partitionKeyPath = CommonConstants.CosmosDbDefaults.partitionKeyPath;

    return {
      ...functionNameValue,
      ...bindingFormValues,
    };
  }

  protected getResourceField(
    setting: BindingSetting,
    formProps: FormikProps<CreateFunctionFormValues>,
    disabled: boolean,
    resourceId: string,
    armResources: IArmResourceTemplate[],
    setArmResources: TSetArmResourceTemplates
  ) {
    /**
     * @todo Make sure that the styles are updated for the resource dropdown here inline with the
     * "onload-validation-errors" PR style update (#10184885).
     */
    return (
      <Field
        component={CosmosDbResourceDropdown}
        disabled={disabled}
        id={setting.name}
        key={setting.name}
        label={setting.label}
        layout={Layout.Horizontal}
        mouseOverToolTip={setting.help}
        name={setting.name}
        onPanel={true}
        required={setting.required}
        resourceId={resourceId}
        setting={setting}
        validate={value => this.validateText(value, setting.required, setting.validators)}
        {...formProps}
        armResources={armResources}
        customLabelClassName={horizontalLabelStyle}
        customLabelStackClassName={horizontalLabelStyle}
        dirty={false}
        setArmResources={setArmResources}
      />
    );
  }

  private _getComboBoxField(
    setting: BindingSetting,
    formProps: FormikProps<CreateFunctionFormValues>,
    disabled: boolean,
    resourceId: string,
    armResources: IArmResourceTemplate[],
    setArmResources: TSetArmResourceTemplates
  ) {
    const component =
      setting.name === SettingNames.databaseName
        ? CosmosDbDatabaseComboBox
        : setting.name === SettingNames.collectionName
        ? CosmosDbContainerComboBox
        : undefined;

    return (
      <Field
        component={component}
        disabled={disabled}
        id={setting.name}
        key={setting.name}
        label={setting.label}
        layout={Layout.Horizontal}
        mouseOverToolTip={setting.help}
        name={setting.name}
        onPanel={true}
        required={setting.required}
        resourceId={resourceId}
        setting={setting}
        validate={value => this._validateComboBox(value, setting.required, setting.validators)}
        {...formProps}
        armResources={armResources}
        customLabelClassName={horizontalLabelStyle}
        customLabelStackClassName={horizontalLabelStyle}
        dirty={false}
        setArmResources={setArmResources}
      />
    );
  }

  private _getProgressiveDisclosureFields(
    formProps: FormikProps<CreateFunctionFormValues>,
    disabled: boolean,
    armResources: IArmResourceTemplate[],
    setArmResources: TSetArmResourceTemplates
  ) {
    return (
      <>
        {!!this.bindingList[0].settings && formProps.values.connectionType === ConnectionType.automatic && (
          <>
            {this.getResourceField(this.bindingList[0].settings[1], formProps, disabled, this.resourceId, armResources, setArmResources)}
            {formProps.values[this.bindingList[0].settings[1].name] &&
              this._getComboBoxField(this.bindingList[0].settings[2], formProps, disabled, this.resourceId, armResources, setArmResources)}
            {formProps.values[this.bindingList[0].settings[2].name] &&
              this._getComboBoxField(this.bindingList[0].settings[3], formProps, disabled, this.resourceId, armResources, setArmResources)}
            {!!formProps.status?.isNewContainer && this.getTextField(this.bindingList[0].settings[4], formProps, disabled)}
          </>
        )}
        {!!this.bindingList[0].settings && formProps.values.connectionType === ConnectionType.manual && (
          <>
            <h3>{this.t('cosmosDb_header_customAppSetting')}</h3>
            {this.getTextField(
              {
                defaultValue: '',
                help: this.t('cosmosDb_tooltip_customAppSettingKey'),
                label: this.t('cosmosDb_label_customAppSettingKey'),
                name: 'customAppSettingKey',
                required: true,
                value: BindingSettingValue.string,
              },
              formProps,
              disabled
            )}
            {this.getTextField(
              {
                defaultValue: '',
                label: this.t('cosmosDb_label_customAppSettingValue'),
                name: 'customAppSettingValue',
                required: true,
                value: BindingSettingValue.string,
              },
              formProps,
              disabled
            )}
            <h3>{this.t('cosmosDb_header_details')}</h3>
            {this.getTextField(this.bindingList[0].settings[2], formProps, disabled)}
            {this.getTextField(this.bindingList[0].settings[3], formProps, disabled)}
          </>
        )}
      </>
    );
  }

  private _getRadioButtonField(setting: BindingSetting, formProps: FormikProps<CreateFunctionFormValues>, disabled: boolean) {
    return (
      <Field
        component={RadioButtonNoFormik}
        defaultSelectedKey={setting.defaultValue}
        disabled={disabled}
        id={setting.name}
        key={setting.name}
        label={setting.label}
        layout={Layout.Horizontal}
        mouseOverToolTip={setting.help}
        name={setting.name}
        onChange={(_, option) => {
          formProps.setFieldValue(setting.name, option.key);
          /** @todo (joechung): #14260766 - Log telemetry. */
        }}
        onPanel={true}
        options={setting.options}
        required={setting.required}
        selectedKey={formProps.values[setting.name]}
        validate={value => this._validateRadioButton(value, setting.required)}
        {...formProps}
        customLabelClassName={horizontalLabelStyle}
        customLabelStackClassName={horizontalLabelStyle}
        dirty={false}
      />
    );
  }

  private _hasWritePermissions(): boolean {
    return !!this.options?.hasResourceGroupWritePermission || !!this.options?.hasSubscriptionWritePermission;
  }

  private _modifyMetadata() {
    // This functionality works on the assumption that the indices don't change (6/29/2021)
    if (!!this.bindingList[0] && !!this.bindingList[0].settings && this.bindingList[0].type === BindingType.cosmosDBTrigger) {
      // Modify existing fields
      this.bindingList[0].settings[0].label = this.t('cosmosDb_label_cosmosDbAccount');
      delete this.bindingList[0].settings[0].help;

      this.bindingList[0].settings[1].label = this.t('cosmosDb_label_database');
      this.bindingList[0].settings[1].validators = [
        {
          expression: ValidationRegex.specialCharacters.source,
          errorText: this.t('cosmosDb_error_databaseNameCharacters'),
        },
        {
          expression: ValidationRegex.noSpacesAtEnd.source,
          errorText: this.t('cosmosDb_error_databaseNameSpace'),
        },
      ];

      this.bindingList[0].settings[2].label = this.t('cosmosDb_label_container');
      this.bindingList[0].settings[2].validators = [
        {
          expression: ValidationRegex.specialCharacters.source,
          errorText: this.t('cosmosDb_error_containerNameCharacters'),
        },
        {
          expression: ValidationRegex.noSpacesAtEnd.source,
          errorText: this.t('cosmosDb_error_containerNameSpace'),
        },
      ];

      // Remove unneeded fields
      this.bindingList[0].settings.splice(3, 2);

      // Add new fields
      this.bindingList[0].settings.unshift({
        defaultValue: 'automatic',
        label: this.t('cosmosDb_label_connection'),
        name: 'connectionType',
        options: [
          {
            disabled: !this._hasWritePermissions(),
            key: 'automatic',
            text: this.t('automatic'),
          },
          {
            key: 'manual',
            text: this.t('manual'),
          },
        ],
        required: true,
        value: BindingSettingValue.radioButtons,
      });

      this.bindingList[0].settings.push({
        defaultValue: CommonConstants.CosmosDbDefaults.partitionKeyPath,
        help: this.t('cosmosDb_tooltip_partitionKeyPath'),
        label: this.t('cosmosDb_label_partitionKeyPath'),
        name: 'partitionKeyPath',
        required: true,
        validators: [
          {
            expression: beginsWithSlash,
            errorText: this.t('cosmosDb_error_partitionKeyPathSlash'),
          },
        ],
        value: BindingSettingValue.string,
      });

      this._metadataHasBeenUpdated = true;
    }
  }

  private _validateComboBox(value: string, required: boolean, validators: BindingValidator[] = []): string | undefined {
    if (required && value === '') {
      return this.t('fieldRequired');
    }

    if (value) {
      for (const validator of validators) {
        if (!value.match(validator.expression)) {
          return validator.errorText;
        }
      }
    }

    return undefined;
  }

  private _validateRadioButton(value: string | undefined, required: boolean): string | undefined {
    if (required && value === undefined) {
      return this.t('fieldRequired');
    }

    return undefined;
  }
}

export default CosmosDbFunctionFormBuilder;
