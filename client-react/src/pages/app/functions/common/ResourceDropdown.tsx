import { FieldProps, FormikProps } from 'formik';
import { Callout, IDropdownOption, IDropdownProps, Link } from 'office-ui-fabric-react';
import React, { useEffect, useState } from 'react';
import SiteService from '../../../../ApiHelpers/SiteService';
import Dropdown, { CustomDropdownProps } from '../../../../components/form-controls/DropDown';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import { ArmObj } from '../../../../models/arm-obj';
import { BindingSetting, BindingSettingResource } from '../../../../models/functions/binding';
import { LogCategories } from '../../../../utils/LogCategories';
import LogService from '../../../../utils/LogService';
import { BindingEditorFormValues } from './BindingFormBuilder';
import { calloutStyle1Field, calloutStyle2Fields, calloutStyle3Fields, linkPaddingStyle } from './callout/Callout.styles';
import NewAppSettingCallout from './callout/NewAppSettingCallout';
import NewDocumentDBConnectionCallout from './callout/NewDocumentDBConnectionCallout';
import NewEventHubConnectionCallout from './callout/NewEventHubConnectionCallout';
import NewServiceBusConnectionCallout from './callout/NewServiceBusConnectionCallout';
import NewStorageAccountConnectionCallout from './callout/NewStorageAccountConnectionCallout';

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

  const options = filterResourcesFromAppSetting(setting, appSettings.properties, newAppSetting && newAppSetting.key);

  // Set the onload value
  if (!field.value && options.length > 0) {
    formProps.setFieldValue(field.name, options[0].key);
  }

  // Set the value when coming back from the callout
  if (selectedItem) {
    onChange(selectedItem, formProps, field, appSettings);
    setSelectedItem(undefined);
  }

  return (
    <div>
      <Dropdown options={options} onChange={(_e, option) => onChange(option, formProps, field, appSettings)} {...props} />
      {!isDisabled ? (
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
  option: IDropdownOption | undefined,
  formProps: FormikProps<BindingEditorFormValues>,
  field: { name: string; value: any },
  appSettings: ArmObj<{ [key: string]: string }>
) => {
  if (option) {
    // Make sure the value is saved to the form
    const appSettingName = option.key;
    formProps.setFieldValue(field.name, appSettingName);

    // Set new App Settings if a PUT is required to update them
    if (option.data) {
      const newAppSettings = appSettings;
      newAppSettings.properties[option.key] = option.data;
      formProps.setFieldValue('newAppSettings', newAppSettings);
    } else {
      formProps.setFieldValue('newAppSettings', null);
    }
  }
};

const filterResourcesFromAppSetting = (
  setting: BindingSetting,
  appSettings: { [key: string]: string },
  newAppSettingName?: string
): IDropdownOption[] => {
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

const getStorageSettings = (appSettings: { [key: string]: string }, newAppSettingName?: string): IDropdownOption[] => {
  const result: IDropdownOption[] = newAppSettingName ? [{ text: `${newAppSettingName} (new)`, key: newAppSettingName }] : [];

  for (const key of Object.keys(appSettings)) {
    const value = appSettings[key].toLowerCase();
    if (value.indexOf('accountname') > -1 && value.indexOf('accountkey') > -1 && key !== newAppSettingName) {
      result.push({ key, text: key });
    }
  }
  return result;
};

const getEventHubAndServiceBusSettings = (appSettings: { [key: string]: string }, newAppSettingName?: string): IDropdownOption[] => {
  const result: IDropdownOption[] = newAppSettingName ? [{ text: `${newAppSettingName} (new)`, key: newAppSettingName }] : [];

  for (const key of Object.keys(appSettings)) {
    const value = appSettings[key].toLowerCase();
    if (value.indexOf('sb://') > -1 && value.indexOf('sharedaccesskeyname') > -1) {
      result.push({ key, text: key });
    }
  }
  return result;
};

const getAppSettings = (appSettings: { [key: string]: string }, newAppSettingName?: string): IDropdownOption[] => {
  const result: IDropdownOption[] = newAppSettingName ? [{ text: `${newAppSettingName} (new)`, key: newAppSettingName }] : [];

  for (const key of Object.keys(appSettings)) {
    result.push({ key, text: key });
  }

  return result;
};

const getDocumentDBSettings = (appSettings: { [key: string]: string }, newAppSettingName?: string): IDropdownOption[] => {
  const result: IDropdownOption[] = newAppSettingName ? [{ text: `${newAppSettingName} (new)`, key: newAppSettingName }] : [];

  for (const key of Object.keys(appSettings)) {
    const value = appSettings[key].toLowerCase();
    if (value.indexOf('accountendpoint') > -1 && value.indexOf('documents.azure.com') > -1) {
      result.push({ key, text: key });
    }
  }
  return result;
};

export default ResourceDropdown;
