import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MessageBarType } from '@fluentui/react';

import ActionBar from '../../../../components/ActionBar';
import MonacoEditor from '../../../../components/monaco-editor/monaco-editor';
import { FormConnectionString } from '../AppSettings.types';

import { formAppSettingToUseStickySetting, formConnectionStringsoUseSlotSetting, getErrorMessage } from './ConnectionStrings.utils';

interface ConnectionStringsBulkEditProps {
  updateAppSetting: (item: FormConnectionString[]) => void;
  closeBlade: () => void;
  connectionStrings: FormConnectionString[];
  disableSlotSetting: boolean;
}
const ConnectionStringsBulkEdit: React.FC<ConnectionStringsBulkEditProps> = props => {
  const { t } = useTranslation();
  const { updateAppSetting, closeBlade, connectionStrings, disableSlotSetting } = props;
  const [errorMessage, setErrorMessage] = useState('');
  const [connectionStringsState, setConnectionStringsState] = useState(
    formConnectionStringsoUseSlotSetting(connectionStrings, disableSlotSetting)
  );

  const validate = newValue => {
    const err = getErrorMessage(newValue, disableSlotSetting, t);
    setErrorMessage(err);
  };
  const save = () => {
    updateAppSetting(formAppSettingToUseStickySetting(connectionStringsState, disableSlotSetting, connectionStrings));
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
    setConnectionStringsState(newValue);
    validate(newValue);
  };
  return (
    <form>
      <MonacoEditor
        value={connectionStringsState}
        language="json"
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
        height="calc(100vh - 140px)"
      />
      <ActionBar
        id="connection-strings-bulk-edit-footer"
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

export default ConnectionStringsBulkEdit;
