import * as React from 'react';
import { AppSetting } from '../../../../modules/site/config/appsettings/appsettings.types';
import { TextField } from 'office-ui-fabric-react/lib-commonjs/TextField';
import { Toggle } from 'office-ui-fabric-react/lib-commonjs/Toggle';
import { translate, InjectedTranslateProps } from 'react-i18next';
export interface AppSettingAddEditProps extends AppSetting {
  updateAppSetting: (item: AppSetting) => any;
}
const AppSettingAddEdit: React.SFC<AppSettingAddEditProps & InjectedTranslateProps> = props => {
  const { updateAppSetting, children, t, ...appSetting } = props;
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
      <TextField label={t('name')} id="app-settings-edit-name" value={props.name} onChanged={updateAppSettingName} />
      <TextField label={t('value')} id="app-settings-edit-value" value={props.value} onChanged={updateAppSettingValue} />
      <Toggle
        label={t('sticky')}
        id="app-settings-edit-sticky"
        defaultChecked={props.sticky}
        onChanged={updateAppSettingSticky}
        onText={t('on')}
        offText={t('off')}
      />
    </div>
  );
};

export default translate()(AppSettingAddEdit);
