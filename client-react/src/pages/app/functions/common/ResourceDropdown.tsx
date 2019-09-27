import React, { useState, useEffect } from 'react';
import { BindingConfigUIDefinition, BindingSettingResource } from '../../../../models/functions/bindings-config';
import { FieldProps, FormikProps } from 'formik';
import Dropdown, { CustomDropdownProps } from '../../../../components/form-controls/DropDown';
import { IDropdownOption, IDropdownProps, Link, Callout } from 'office-ui-fabric-react';
import SiteService from '../../../../ApiHelpers/SiteService';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import NewResourceConnection from './NewResourceConnection';
import { ArmObj } from '../../../../models/arm-obj';
import { BindingEditorFormValues } from './BindingFormBuilder';

export interface ResourceDropdownProps {
  setting: BindingConfigUIDefinition;
  resourceId: string;
}

const paddingStyle = {
  marginTop: '-5px',
  paddingBottom: '30px',
};

const ResourceDropdown: React.SFC<ResourceDropdownProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const { setting, resourceId, form: formProps, field } = props;
  const [appSettings, setAppSettings] = useState<ArmObj<{ [key: string]: string }> | undefined>(undefined);
  const [selectedItem, setSelectedItem] = useState<IDropdownOption | undefined>(undefined);
  const [newAppSettingName, setNewAppSettingName] = useState<string | undefined>(undefined);
  const [isCalloutVisible, setIsCalloutVisible] = useState<boolean>(false);
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
    return null;
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
        <Link id="target" onClick={() => setIsCalloutVisible(!isCalloutVisible)}>
          {isCalloutVisible ? 'Cancel' : 'New'}
        </Link>
        <Callout onDismiss={() => setIsCalloutVisible(false)} target={'#target'} hidden={!isCalloutVisible}>
          <NewResourceConnection
            resourceId={resourceId}
            setNewAppSettingName={setNewAppSettingName}
            setIsCalloutVisible={setIsCalloutVisible}
            {...props}
          />
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
) => {
  const result: string[] = newAppSettingName ? [`${newAppSettingName} (new)`] : [];
  switch (setting.resource) {
    case BindingSettingResource.Storage:
      for (const key in appSettings) {
        if (key in appSettings) {
          const value = appSettings[key].toLowerCase();
          if (value.indexOf('accountname') > -1 && value.indexOf('accountkey') > -1) {
            result.push(key);
          }
        }
      }
      break;
  }
  return result;
};

export default ResourceDropdown;
