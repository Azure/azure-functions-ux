import React, { useState, useEffect } from 'react';
import { BindingSetting, BindingSettingResource } from '../../../../models/functions/binding';
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
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import NewDocumentDBConnectionCallout from './callout/NewDocumentDBConnectionCallout';
import NewAppSettingCallout from './callout/NewAppSettingCallout';
import { linkPaddingStyle, calloutStyle3Fields, calloutStyle2Fields, calloutStyle1Field } from './callout/Callout.styles';

export interface ResourceDropdownProps {
  setting: BindingSetting;
  resourceId: string;
}

const ResourceDropdown: React.SFC<ResourceDropdownProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const { setting, resourceId, form: formProps, field, isDisabled } = props;
  const [appSettings, setAppSettings] = useState<ArmObj<{ [key: string]: string }> | undefined>(undefined);
  const [selectedItem, setSelectedItem] = useState<IDropdownOption | undefined>(undefined);
  const [newAppSetting, setNewAppSetting] = useState<{ key: string; value: string } | undefined>(undefined);
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);

  useEffect(() => {
    SiteService.fetchApplicationSettings(resourceId).then(r => {
      if (!r.metadata.success) {
        LogService.trackEvent(LogCategories.bindingResource, 'getAppSettings', `Failed to get appSettings: ${r.metadata.error}`);
        return;
      }
      setAppSettings(r.data);
    });
  }, [resourceId]);

  if (!appSettings) {
    return <LoadingComponent />;
  }

  const options: IDropdownOption[] = [];
  const resourceAppSettings = filterResourcesFromAppSetting(setting, appSettings.properties, newAppSetting && newAppSetting.key);
  resourceAppSettings.forEach((resourceAppSetting, i) => options.push({ text: resourceAppSetting, key: i }));

  if (!selectedItem && options.length > 0) {
    onChange(options[0], formProps, field, setSelectedItem, appSettings, newAppSetting);
  }
  return (
    <div>
      <Dropdown
        options={options}
        selectedKey={selectedItem ? selectedItem.key : undefined}
        onChange={(e, o) => {
          onChange(o as IDropdownOption, formProps, field, setSelectedItem, appSettings, newAppSetting);
        }}
        {...props}
      />
      {isDisabled ? (
        <div style={linkPaddingStyle}>
          <Link id="target" onClick={() => setIsDialogVisible(true)}>
            {'New'}
          </Link>
          {setting.resource === BindingSettingResource.Storage && (
            <Callout onDismiss={() => setIsDialogVisible(false)} target={'#target'} hidden={!isDialogVisible} style={calloutStyle1Field}>
              <NewStorageAccountConnectionCallout
                resourceId={resourceId}
                setNewAppSetting={setNewAppSetting}
                setSelectedItem={setSelectedItem}
                setIsDialogVisible={setIsDialogVisible}
                {...props}
              />
            </Callout>
          )}
          {setting.resource === BindingSettingResource.EventHub && (
            <Callout onDismiss={() => setIsDialogVisible(false)} target={'#target'} hidden={!isDialogVisible} style={calloutStyle3Fields}>
              <NewEventHubConnectionCallout
                resourceId={resourceId}
                setNewAppSetting={setNewAppSetting}
                setSelectedItem={setSelectedItem}
                setIsDialogVisible={setIsDialogVisible}
                {...props}
              />
            </Callout>
          )}
          {setting.resource === BindingSettingResource.ServiceBus && (
            <Callout onDismiss={() => setIsDialogVisible(false)} target={'#target'} hidden={!isDialogVisible} style={calloutStyle2Fields}>
              <NewServiceBusConnectionCallout
                resourceId={resourceId}
                setNewAppSetting={setNewAppSetting}
                setSelectedItem={setSelectedItem}
                setIsDialogVisible={setIsDialogVisible}
                {...props}
              />
            </Callout>
          )}
          {setting.resource === BindingSettingResource.DocumentDB && (
            <Callout onDismiss={() => setIsDialogVisible(false)} target={'#target'} hidden={!isDialogVisible} style={calloutStyle2Fields}>
              <NewDocumentDBConnectionCallout
                resourceId={resourceId}
                setNewAppSetting={setNewAppSetting}
                setSelectedItem={setSelectedItem}
                setIsDialogVisible={setIsDialogVisible}
                {...props}
              />
            </Callout>
          )}
          {setting.resource === BindingSettingResource.AppSetting && (
            <Callout onDismiss={() => setIsDialogVisible(false)} target={'#target'} hidden={!isDialogVisible} style={calloutStyle2Fields}>
              <NewAppSettingCallout
                resourceId={resourceId}
                setNewAppSetting={setNewAppSetting}
                setSelectedItem={setSelectedItem}
                setIsDialogVisible={setIsDialogVisible}
                {...props}
              />
            </Callout>
          )}
        </div>
      ) : (
        undefined
      )}
    </div>
  );
};

const onChange = (
  option: IDropdownOption,
  formProps: FormikProps<BindingEditorFormValues>,
  field: { name: string; value: any },
  setSelectedItem: any,
  appSettings: ArmObj<{ [key: string]: string }>,
  newAppSetting?: { key: string; value: string }
) => {
  // Make sure the value is saved to the form
  setSelectedItem(option);
  const appSettingName = option.text.split(' ')[0]; // allisonm: removes (new) if present
  formProps.setFieldValue(field.name, appSettingName);

  // Set new App Settings if a PUT is required to update them
  if (option.text.endsWith('(new)') && newAppSetting) {
    const newAppSettings = appSettings;
    newAppSettings.properties[newAppSetting.key] = newAppSetting.value;
    formProps.setFieldValue('newAppSettings', newAppSettings);
  } else {
    formProps.setFieldValue('newAppSettings', null);
  }
};

const filterResourcesFromAppSetting = (
  setting: BindingSetting,
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
    if (value.indexOf('accountname') > -1 && value.indexOf('accountkey') > -1 && key !== newAppSettingName) {
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
