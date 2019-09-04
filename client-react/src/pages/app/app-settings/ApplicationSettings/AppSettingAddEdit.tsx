import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ActionBar from '../../../../components/ActionBar';
import { formElementStyle } from '../AppSettings.styles';
import { FormAppSetting } from '../AppSettings.types';
import { MessageBarType, MessageBar } from 'office-ui-fabric-react/lib';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import AppSettingKeyVault from './AppSettingKeyVault';

export interface AppSettingAddEditProps {
  updateAppSetting: (item: FormAppSetting) => void;
  closeBlade: () => void;
  otherAppSettings: FormAppSetting[];
  appSetting: FormAppSetting;
  disableSlotSetting: boolean;
  isLinux: boolean;
}
const AppSettingAddEdit: React.SFC<AppSettingAddEditProps> = props => {
  const { updateAppSetting, otherAppSettings, closeBlade, appSetting, disableSlotSetting, isLinux } = props;
  const [nameError, setNameError] = useState('');
  const [currentAppSetting, setCurrentAppSetting] = useState(appSetting);
  const { t } = useTranslation();
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
    if (!value) {
      return t('appSettingPropIsRequired').format('name');
    }
    if (isLinux && /[^\w\.]/.test(value)) {
      return t('validation_linuxAppSettingNameError');
    }
    return otherAppSettings.filter(v => v.name.toLowerCase() === value.toLowerCase()).length >= 1 ? t('appSettingNamesUnique') : '';
  };

  const save = () => {
    updateAppSetting(currentAppSetting);
  };

  const cancel = () => {
    closeBlade();
  };

  const actionBarPrimaryButtonProps = {
    id: 'save',
    title: t('ok'),
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
        <TextFieldNoFormik
          label={t('nameRes')}
          id="app-settings-edit-name"
          widthOverride="100%"
          value={currentAppSetting.name}
          errorMessage={nameError}
          onChange={updateAppSettingName}
          autoFocus
        />
        <TextFieldNoFormik
          label={t('value')}
          id="app-settings-edit-value"
          widthOverride="100%"
          value={currentAppSetting.value}
          onChange={updateAppSettingValue}
        />
        <Checkbox
          label={t('sticky')}
          id="app-settings-edit-sticky"
          disabled={disableSlotSetting}
          defaultChecked={currentAppSetting.sticky}
          onChange={updateAppSettingSticky}
          styles={{
            root: formElementStyle,
          }}
        />
        {disableSlotSetting && (
          <div data-cy="app-setting-slot-setting-no-permission-message">
            <MessageBar messageBarType={MessageBarType.warning} isMultiline={true}>
              {t('slotSettingNoProdPermission')}
            </MessageBar>
          </div>
        )}
        <ActionBar
          id="app-settings-edit-footer"
          primaryButton={actionBarPrimaryButtonProps}
          secondaryButton={actionBarSecondaryButtonProps}
        />
      </form>
      {true && <AppSettingKeyVault />}
    </>
  );
};

export default AppSettingAddEdit;
