import * as React from 'react';
import { AppSetting } from '../../../../modules/site/config/appsettings/appsettings.types';
import { TextField } from 'office-ui-fabric-react/lib-commonjs/TextField';
import { Toggle } from 'office-ui-fabric-react/lib-commonjs/Toggle';
export interface AppSettingAddEditProps extends AppSetting {
  updateAppSetting: (item: AppSetting) => any;
}
const AppSettingAddEdit: React.SFC<AppSettingAddEditProps> = props => {
  const { updateAppSetting, children, ...appSetting } = props;
  const updateAppSettingName = (name: string) => {
    props.updateAppSetting({ ...appSetting, name });
  };

  const updateAppSettingValue = (value: string) => {
    props.updateAppSetting({ ...appSetting, value });
  };

  const updateAppSettingSticky = (sticky: boolean) => {
    props.updateAppSetting({ ...appSetting, sticky });
  };
  return (
    <div>
      <TextField label="Name" id="name" value={props.name} onChanged={updateAppSettingName} />
      <TextField label="Value" id="value" value={props.value} onChanged={updateAppSettingValue} />
      <Toggle label="Sticky" id="sticky" defaultChecked={props.sticky} onChanged={updateAppSettingSticky} onText="On" offText="Off" />
    </div>
  );
};

export default AppSettingAddEdit;
