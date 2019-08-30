import React, { useState, useEffect } from 'react';
import { BindingConfigUIDefinition, BindingSettingResource } from '../../../../models/functions/bindings-config';
import { FieldProps } from 'formik';
import Dropdown, { CustomDropdownProps } from '../../../../components/form-controls/DropDown';
import { IDropdownOption, IDropdownProps } from 'office-ui-fabric-react';
import SiteService from '../../../../ApiHelpers/SiteService';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';

export interface ResourceDropdownProps {
  setting: BindingConfigUIDefinition;
  resourceId: string;
}

const ResourceDropdown: React.SFC<ResourceDropdownProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const { setting, resourceId } = props;
  const [resourceAppSettings, setResourceAppSettings] = useState<string[] | undefined>(undefined);
  useEffect(() => {
    SiteService.fetchApplicationSettings(resourceId).then(r => {
      if (!r.metadata.success) {
        LogService.trackEvent(LogCategories.bindingResource, 'getAppSettings', `Failed to get appSettings: ${r.metadata.error}`);
        return;
      }
      setResourceAppSettings(filterResourcesFromAppSetting(setting, r.data.properties));
    });
  }, []);

  if (!resourceAppSettings) {
    return null;
  }

  const options: IDropdownOption[] = [];
  resourceAppSettings.forEach((resourceAppSetting, i) => options.push({ text: resourceAppSetting, key: i }));
  return <Dropdown options={options} defaultSelectedKey={0} {...props} />;
};

const filterResourcesFromAppSetting = (setting: BindingConfigUIDefinition, appSettings: { [key: string]: string }) => {
  const result: string[] = [];
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
