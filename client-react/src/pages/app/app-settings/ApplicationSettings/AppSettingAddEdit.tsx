import * as React from 'react';
import { AppSetting } from '../../../../modules/site/config/appsettings/appsettings.types';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { translate, InjectedTranslateProps } from 'react-i18next';
import { formElementStyle } from '../AppSettings.Styles';
import FormActionBar from '../../../../components/FormActionBar';
export interface AppSettingAddEditProps {
  updateAppSetting: (item: AppSetting) => void;
  closeBlade: () => void;
  otherAppSettings: AppSetting[];
  appSetting: AppSetting;
}
const AppSettingAddEdit: React.SFC<AppSettingAddEditProps & InjectedTranslateProps> = props => {
  const { updateAppSetting, t, otherAppSettings, closeBlade, appSetting } = props;
  const [nameError, setNameError] = React.useState('');
  const [currentAppSetting, setCurrentAppSetting] = React.useState(appSetting);

  const updateAppSettingName = (e: any, name: string) => {
    const error = validateAppSettingName(name);
    setNameError(error);
    setCurrentAppSetting({ ...currentAppSetting, name });
  };

  const updateAppSettingValue = (e: any, value: string) => {
    setCurrentAppSetting({ ...currentAppSetting, value });
  };

  const updateAppSettingSticky = (e: any, sticky: boolean) => {
    setCurrentAppSetting({ ...currentAppSetting, sticky });
  };

  const validateAppSettingName = (value: string) => {
    return otherAppSettings.filter(v => v.name.toLowerCase() === value.toLowerCase()).length >= 1 ? 'App setting names must be unique' : '';
  };

  const save = () => {
    updateAppSetting(currentAppSetting);
  };

  const cancel = () => {
    closeBlade();
  };
  return (
    <>
      <form>
        <TextField
          label={t('nameRes')}
          id="app-settings-edit-name"
          value={currentAppSetting.name}
          errorMessage={nameError}
          onChange={updateAppSettingName}
          styles={{
            root: formElementStyle,
          }}
        />
        <TextField
          label={t('value')}
          id="app-settings-edit-value"
          value={currentAppSetting.value}
          onChange={updateAppSettingValue}
          styles={{
            root: formElementStyle,
          }}
        />
        <Checkbox
          label={t('sticky')}
          id="app-settings-edit-sticky"
          defaultChecked={currentAppSetting.sticky}
          onChange={updateAppSettingSticky}
          styles={{
            root: formElementStyle,
          }}
        />
        <FormActionBar id="app-settings-edit-footer" save={save} valid={!nameError} cancel={cancel} />
      </form>
    </>
  );
};

export default translate('translation')(AppSettingAddEdit);
