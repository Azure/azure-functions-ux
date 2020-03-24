import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import TextFieldNoFormik from '../../../../../components/form-controls/TextFieldNoFormik';
import { addEditFormStyle } from '../../../../../components/form-controls/formControl.override.styles';
import ActionBar from '../../../../../components/ActionBar';
import { FunctionKeysModel } from './FunctionKeys.types';
import { renewPanelStyle, renewPanelTextStyle, renewPanelIconStyle } from '../../app-keys/AppKeys.styles';
import { Icon, Label } from 'office-ui-fabric-react';
import { ThemeContext } from '../../../../../ThemeContext';

export interface FunctionKeyAddEditProps {
  createAppKey: (item: FunctionKeysModel) => void;
  closeBlade: () => void;
  showRenewKeyDialog: (item: FunctionKeysModel) => void;
  appKey: FunctionKeysModel;
  otherAppKeys: FunctionKeysModel[];
  resourceId: string;
  panelItem: string;
  readOnlyPermission: boolean;
}

const FunctionKeyAddEdit: React.FC<FunctionKeyAddEditProps> = props => {
  const { appKey, otherAppKeys, createAppKey, closeBlade, panelItem, showRenewKeyDialog, readOnlyPermission } = props;
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
    disable: readOnlyPermission || !!nameError || !currentAppKey.name,
  };

  const actionBarSecondaryButtonProps = {
    id: 'cancel',
    title: t('cancel'),
    onClick: closeBlade,
    disable: false,
  };

  const validateAppKeyName = (value: string) => {
    if (!value) {
      return t('functionKeyPropIsRequired').format('name');
    }
    return otherAppKeys.filter(v => v.name.toLowerCase() === value.toLowerCase()).length >= 1 ? t('functionKeyNamesUnique') : '';
  };

  const renewKey = () => {
    showRenewKeyDialog(appKey);
    closeBlade();
  };

  return (
    <>
      <form className={addEditFormStyle}>
        {!readOnlyPermission && panelItem === 'edit' && (
          <Label className={renewPanelStyle()} onClick={renewKey}>
            <Icon iconName="Refresh" className={renewPanelIconStyle(theme)} />
            <span className={renewPanelTextStyle()}>{t('renewAppKey')}</span>
          </Label>
        )}
        <TextFieldNoFormik
          label={t('nameRes')}
          id="function-key-edit-name"
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
          id="function-key-edit-value"
          widthOverride="100%"
          value={currentAppKey.value}
          onChange={updateAppKeyValue}
          placeholder={t('defaultValueAppKey')}
          copyButton={true}
        />
        <ActionBar
          id="function-key-edit-footer"
          primaryButton={actionBarPrimaryButtonProps}
          secondaryButton={actionBarSecondaryButtonProps}
        />
      </form>
    </>
  );
};

export default FunctionKeyAddEdit;
