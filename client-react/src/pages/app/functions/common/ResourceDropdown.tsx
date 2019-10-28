import React, { useState, useEffect } from 'react';
import { BindingConfigUIDefinition, BindingSettingResource } from '../../../../models/functions/bindings-config';
import { FieldProps, FormikProps } from 'formik';
import Dropdown, { CustomDropdownProps } from '../../../../components/form-controls/DropDown';
import { IDropdownOption, IDropdownProps, Link, Callout } from 'office-ui-fabric-react';
import SiteService from '../../../../ApiHelpers/SiteService';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import NewStorageAccountConnectionCallout from './callout/NewStorageAccountConnectionCallout';
import { ArmObj } from '../../../../models/arm-obj';
import { BindingEditorFormValues } from './BindingFormBuilder';
import NewEventHubConnectionCallout from './callout/NewEventHubConnectionCallout';
import NewServiceBusConnectionCallout from './callout/NewServiceBusConnectionCallout';
import LoadingComponent from '../../../../components/loading/loading-component';

export interface ResourceDropdownProps {
  setting: BindingConfigUIDefinition;
  resourceId: string;
}

const paddingStyle = {
  marginTop: '-10px',
  paddingBottom: '10px',
};

const calloutSyle = {
  padding: '10px',
  height: 300,
  width: 400,
};

const ResourceDropdown: React.SFC<ResourceDropdownProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const { setting, resourceId, form: formProps, field } = props;
  const [appSettings, setAppSettings] = useState<ArmObj<{ [key: string]: string }> | undefined>(undefined);
  const [selectedItem, setSelectedItem] = useState<IDropdownOption | undefined>(undefined);
  const [newAppSettingName, setNewAppSettingName] = useState<string | undefined>(undefined);
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);

  useEffect(() => {
    SiteService.fetchApplicationSettings(resourceId).then(r => {
      if (!r.metadata.success) {
        LogService.trackEvent(LogCategories.bindingResource, 'getAppSettings', `Failed to get appSettings: ${r.metadata.error}`);
        return;
      }
      setAppSettings(r.data);
    });
  }, []);

  if (!appSettings) {
    return <LoadingComponent />;
  }

  const options: IDropdownOption[] = [];
  const resourceAppSettings = filterResourcesFromAppSetting(setting, appSettings.properties, newAppSettingName);
  resourceAppSettings.forEach((resourceAppSetting, i) => options.push({ text: resourceAppSetting, key: i }));

  if (!selectedItem && options.length > 0) {
    onChange(options[0], formProps, field, setSelectedItem);
  }
  return (
    <div>
      <Dropdown
        options={options}
        selectedKey={selectedItem ? selectedItem.key : undefined}
        onChange={(e, o) => {
          onChange(o as IDropdownOption, formProps, field, setSelectedItem);
        }}
        {...props}
      />
      <div style={paddingStyle}>
        <Link id="target" onClick={() => setIsDialogVisible(true)}>
          {'New'}
        </Link>
        <Callout onDismiss={() => setIsDialogVisible(false)} target={'#target'} hidden={!isDialogVisible} style={calloutSyle}>
          {setting.resource === BindingSettingResource.Storage && (
            <NewStorageAccountConnectionCallout
              resourceId={resourceId}
              setNewAppSettingName={setNewAppSettingName}
              setIsDialogVisible={setIsDialogVisible}
              {...props}
            />
          )}
          {setting.resource === BindingSettingResource.EventHub && (
            <NewEventHubConnectionCallout
              resourceId={resourceId}
              setNewAppSettingName={setNewAppSettingName}
              setIsDialogVisible={setIsDialogVisible}
              {...props}
            />
          )}
          {setting.resource === BindingSettingResource.ServiceBus && (
            <NewServiceBusConnectionCallout
              resourceId={resourceId}
              setNewAppSettingName={setNewAppSettingName}
              setIsDialogVisible={setIsDialogVisible}
              {...props}
            />
          )}
          {setting.resource === BindingSettingResource.DocumentDB && (
            <NewServiceBusConnectionCallout
              resourceId={resourceId}
              setNewAppSettingName={setNewAppSettingName}
              setIsDialogVisible={setIsDialogVisible}
              {...props}
            />
          )}
        </Callout>
      </div>
    </div>
  );
};

const onChange = (
  option: IDropdownOption,
  formProps: FormikProps<BindingEditorFormValues>,
  field: { name: string; value: any },
  setSelectedItem: any
) => {
  setSelectedItem(option);
  const appSettingName = option.text.split(' ')[0]; // allisonm: removes (new) if present
  formProps.setFieldValue(field.name, appSettingName);
};

const filterResourcesFromAppSetting = (
  setting: BindingConfigUIDefinition,
  appSettings: { [key: string]: string },
  newAppSettingName?: string
): string[] => {
  switch (setting.resource) {
    case BindingSettingResource.Storage:
      return getStorageSettings(appSettings, newAppSettingName);
    case BindingSettingResource.EventHub:
    case BindingSettingResource.ServiceBus:
      return getEventHubAndServiceBusSettings(appSettings, newAppSettingName);
    case BindingSettingResource.AppSetting:
      return getAppSettings(appSettings, newAppSettingName);
    case BindingSettingResource.DocumentDB:
      return getDocumentDBSettings(appSettings, newAppSettingName);
  }
  return [];
};

const getStorageSettings = (appSettings: { [key: string]: string }, newAppSettingName?: string): string[] => {
  const result: string[] = newAppSettingName ? [`${newAppSettingName} (new)`] : [];
  for (const key of Object.keys(appSettings)) {
    const value = appSettings[key].toLowerCase();
    if (value.indexOf('accountname') > -1 && value.indexOf('accountkey') > -1) {
      result.push(key);
    }
  }
  return result;
};

const getEventHubAndServiceBusSettings = (appSettings: { [key: string]: string }, newAppSettingName?: string): string[] => {
  const result: string[] = newAppSettingName ? [`${newAppSettingName} (new)`] : [];
  for (const key of Object.keys(appSettings)) {
    const value = appSettings[key].toLowerCase();
    if (value.indexOf('sb://') > -1 && value.indexOf('sharedaccesskeyname') > -1) {
      result.push(key);
    }
  }
  return result;
};

const getAppSettings = (appSettings: { [key: string]: string }, newAppSettingName?: string): string[] => {
  const result: string[] = newAppSettingName ? [`${newAppSettingName} (new)`] : [];
  for (const key of Object.keys(appSettings)) {
    result.push(key);
  }

  return result;
};

const getDocumentDBSettings = (appSettings: { [key: string]: string }, newAppSettingName?: string): string[] => {
  const result: string[] = newAppSettingName ? [`${newAppSettingName} (new)`] : [];
  for (const key of Object.keys(appSettings)) {
    const value = appSettings[key].toLowerCase();
    if (value.indexOf('accountendpoint') > -1 && value.indexOf('documents.azure.com') > -1) {
      result.push(key);
    }
  }
  return result;
};

export default ResourceDropdown;
