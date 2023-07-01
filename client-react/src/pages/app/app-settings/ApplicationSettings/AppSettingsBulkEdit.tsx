import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MessageBarType } from '@fluentui/react';

import ActionBar from '../../../../components/ActionBar';
import MonacoEditor from '../../../../components/monaco-editor/monaco-editor';
import { FormAppSetting } from '../AppSettings.types';

import { formAppSettingToUseSlotSetting, formAppSettingToUseStickySetting, getErrorMessage } from './ApplicationSettings.utils';

interface AppSettingsBulkEditProps {
  updateAppSetting: (item: FormAppSetting[]) => void;
  closeBlade: () => void;
  appSettings: FormAppSetting[];
  disableSlotSetting: boolean;
  isLinux: boolean;
}
const AppSettingsBulkEdit: React.FC<AppSettingsBulkEditProps> = props => {
  const { t } = useTranslation();
  const { updateAppSetting, closeBlade, appSettings, disableSlotSetting, isLinux } = props;
  const [errorMessage, setErrorMessage] = useState('');
  const [appSettingsState, setAppSettingsState] = useState(formAppSettingToUseSlotSetting(appSettings, disableSlotSetting));

  const validate = newValue => {
    const err = getErrorMessage(newValue, disableSlotSetting, isLinux, t);
    setErrorMessage(err);
  };
  const save = () => {
    updateAppSetting(formAppSettingToUseStickySetting(appSettingsState, disableSlotSetting, appSettings));
  };

  const cancel = () => {
    closeBlade();
  };

  const actionBarPrimaryButtonProps = {
    id: 'save',
    title: t('ok'),
    onClick: save,
    disable: !!errorMessage,
  };

  const actionBarSecondaryButtonProps = {
    id: 'cancel',
    title: t('cancel'),
    onClick: cancel,
    disable: false,
  };

  const onChange = newValue => {
    setAppSettingsState(newValue);
    validate(newValue);
  };
  return (
    <form>
      <MonacoEditor
        value={appSettingsState}
        language="json"
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
        height="calc(100vh - 140px)"
      />
      <ActionBar
        id="app-settings-bulk-edit-footer"
        primaryButton={actionBarPrimaryButtonProps}
        secondaryButton={actionBarSecondaryButtonProps}
        statusMessage={
          errorMessage
            ? {
                message: errorMessage,
                level: MessageBarType.error,
              }
            : undefined
        }
      />
    </form>
  );
};

export default AppSettingsBulkEdit;
