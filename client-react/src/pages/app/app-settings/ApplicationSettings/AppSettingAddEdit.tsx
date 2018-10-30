import * as React from 'react';
import { AppSetting } from '../../../../modules/site/config/appsettings/appsettings.types';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { translate, InjectedTranslateProps } from 'react-i18next';
export interface AppSettingAddEditProps extends AppSetting {
  updateAppSetting: (item: AppSetting) => any;
  otherAppSettings: AppSetting[];
}
const AppSettingAddEdit: React.SFC<AppSettingAddEditProps & InjectedTranslateProps> = props => {
  const { updateAppSetting, children, t, otherAppSettings, ...appSetting } = props;
  const [nameError, setNameError] = React.useState('');
  const updateAppSettingName = (name: string) => {
    const error = validateAppSettingName(name);
    setNameError(error);
    props.updateAppSetting({ ...appSetting, name });
  };

  const updateAppSettingValue = (value: string) => {
    props.updateAppSetting({ ...appSetting, value });
  };

  const updateAppSettingSticky = (sticky: boolean) => {
    props.updateAppSetting({ ...appSetting, sticky });
  };

  const validateAppSettingName = (value: string) => {
    return otherAppSettings.filter(v => v.name === value).length >= 1 ? 'App setting names must be unique' : '';
  };

  return (
    <form>
      <TextField
        label={t('nameRes')}
        id="app-settings-edit-name"
        value={props.name}
        errorMessage={nameError}
        onChanged={updateAppSettingName}
      />
      <TextField label={t('value')} id="app-settings-edit-value" value={props.value} onChanged={updateAppSettingValue} />
      <Toggle
        label={t('sticky')}
        id="app-settings-edit-sticky"
        defaultChecked={props.sticky}
        onChanged={updateAppSettingSticky}
        onText={t('on')}
        offText={t('off')}
      />
    </form>
  );
};

export default translate('translation')(AppSettingAddEdit);
