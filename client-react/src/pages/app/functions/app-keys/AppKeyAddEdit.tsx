import React, { useState, useContext } from 'react';
import { AppKeysModel } from './AppKeys.types';
import { useTranslation } from 'react-i18next';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import { addEditFormStyle } from '../../../../components/form-controls/formControl.override.styles';
import ActionBar from '../../../../components/ActionBar';
import { Stack, ActionButton } from 'office-ui-fabric-react';
import { tableActionButtonStyle, addPanelCommandBar } from './AppKeys.styles';
import { ThemeContext } from '../../../../ThemeContext';

export interface AppKeyAddEditProps {
  createAppKey: (item: AppKeysModel) => void;
  closeBlade: () => void;
  appKey: AppKeysModel;
  otherAppKeys: AppKeysModel[];
  resourceId: string;
  panelItem: string;
}

const AppKeyAddEdit: React.FC<AppKeyAddEditProps> = props => {
  const { appKey, otherAppKeys, createAppKey, closeBlade, panelItem } = props;
  const [nameError, setNameError] = useState('');
  const [currentAppKey, setCurrentAppKey] = useState(appKey);

  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  const updateAppKeyName = (e: any, name: string) => {
    const error = validateAppKeyName(name);
    setNameError(error);
    setCurrentAppKey({ ...currentAppKey, name });
  };

  const updateAppKeyValue = (e: any, value: string) => {
    setCurrentAppKey({ ...currentAppKey, value });
  };

  const actionBarPrimaryButtonProps = {
    id: 'save',
    title: t('ok'),
    onClick: () => createAppKey(currentAppKey),
    disable: !!nameError,
  };

  const actionBarSecondaryButtonProps = {
    id: 'cancel',
    title: t('cancel'),
    onClick: closeBlade,
    disable: false,
  };

  const validateAppKeyName = (value: string) => {
    if (!value) {
      return t('appKeyPropIsRequired').format('name');
    }
    return otherAppKeys.filter(v => v.name.toLowerCase() === value.toLowerCase()).length >= 1 ? t('appKeyNamesUnique') : '';
  };

  const renewAppKey = () => {
    createAppKey({ name: appKey.name, value: '' });
    closeBlade();
  };

  return (
    <>
      <div className={addPanelCommandBar(theme)}>
        <Stack horizontal verticalAlign="center">
          <ActionButton
            id="app-keys-renew-key"
            disabled={false}
            styles={tableActionButtonStyle}
            iconProps={{ iconName: 'Refresh' }}
            ariaLabel={t('renewAppKey')}
            onClick={renewAppKey}>
            {t('renewAppKey')}
          </ActionButton>
        </Stack>
      </div>
      <form className={addEditFormStyle}>
        <TextFieldNoFormik
          label={t('nameRes')}
          id="app-key-edit-name"
          widthOverride="100%"
          value={currentAppKey.name}
          errorMessage={nameError}
          onChange={updateAppKeyName}
          placeholder={t('enterAppKeyName')}
          copyButton={true}
          disabled={panelItem === 'edit' ? true : false}
          autoFocus
        />
        <TextFieldNoFormik
          label={t('value')}
          id="app-key-edit-value"
          widthOverride="100%"
          value={currentAppKey.value}
          onChange={updateAppKeyValue}
          placeholder={t('defaultValueAppKey')}
          copyButton={true}
        />
        <ActionBar id="app-key-edit-footer" primaryButton={actionBarPrimaryButtonProps} secondaryButton={actionBarSecondaryButtonProps} />
      </form>
    </>
  );
};

export default AppKeyAddEdit;
