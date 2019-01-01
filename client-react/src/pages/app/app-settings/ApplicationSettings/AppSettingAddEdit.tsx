import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import * as React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';

import ActionBar from '../../../../components/ActionBar';
import { formElementStyle } from '../AppSettings.styles';
import { FormAppSetting } from '../AppSettings.types';

export interface AppSettingAddEditProps {
  updateAppSetting: (item: FormAppSetting) => void;
  closeBlade: () => void;
  otherAppSettings: FormAppSetting[];
  appSetting: FormAppSetting;
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

  const actionBarPrimaryButtonProps = {
    id: 'save',
    title: t('save'),
    onClick: save,
    disable: !!nameError,
  };

  const actionBarSecondaryButtonProps = {
    id: 'cancel',
    title: t('cancel'),
    onClick: cancel,
    disable: false,
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
        <ActionBar
          id="app-settings-edit-footer"
          primaryButton={actionBarPrimaryButtonProps}
          secondaryButton={actionBarSecondaryButtonProps}
        />
      </form>
    </>
  );
};

export default translate('translation')(AppSettingAddEdit);
