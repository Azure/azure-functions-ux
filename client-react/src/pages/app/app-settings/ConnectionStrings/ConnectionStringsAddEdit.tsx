import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ActionBar from '../../../../components/ActionBar';
import { formElementStyle } from '../AppSettings.styles';
import { FormConnectionString } from '../AppSettings.types';
import { DatabaseType, typeValueToString } from './connectionStringTypes';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import DropdownNoFormik from '../../../../components/form-controls/DropDownnoFormik';

export interface ConnectionStringAddEditProps {
  updateConnectionString: (item: FormConnectionString) => any;
  closeBlade: () => void;
  otherConnectionStrings: FormConnectionString[];
  connectionString: FormConnectionString;
  disableSlotSetting: boolean;
}

const ConnectionStringsAddEdit: React.SFC<ConnectionStringAddEditProps> = props => {
  const { updateConnectionString, otherConnectionStrings, closeBlade, connectionString, disableSlotSetting } = props;
  const [nameError, setNameError] = useState('');
  const [valueError, setValueError] = useState('');
  const [currentConnectionString, setCurrentConnectionString] = useState(connectionString);
  const { t } = useTranslation();
  const validateConnectionStringName = (value: string) => {
    if (!value) {
      return t('connectionStringPropIsRequired').format('name');
    }
    return otherConnectionStrings.filter(v => v.name === value).length >= 1 ? t('connectionStringNamesUnique') : '';
  };
  const updateConnectionStringName = (e: any, name: string) => {
    const error = validateConnectionStringName(name);
    setNameError(error);
    setCurrentConnectionString({ ...currentConnectionString, name });
  };

  const validateConnectionStringValue = (value: string) => {
    return !value ? t('connectionStringPropIsRequired').format('value') : '';
  };
  const updateConnectionStringValue = (e: any, value: string) => {
    const error = validateConnectionStringValue(name);
    setValueError(error);
    setCurrentConnectionString({ ...currentConnectionString, value });
  };

  const updateConnectionStringType = (e: any, typeOption: IDropdownOption) => {
    setCurrentConnectionString({ ...currentConnectionString, type: typeOption.key as string });
  };

  const updateConnectionStringSticky = (e: any, sticky: boolean) => {
    setCurrentConnectionString({ ...currentConnectionString, sticky });
  };

  const save = () => {
    updateConnectionString(currentConnectionString);
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
    <form>
      <TextFieldNoFormik
        label={t('nameRes')}
        widthOverride="100%"
        id="connection-strings-form-name"
        value={currentConnectionString.name}
        errorMessage={nameError}
        onChange={updateConnectionStringName}
        autoFocus
      />
      <TextFieldNoFormik
        label={t('value')}
        widthOverride="100%"
        id="connection-strings-form-value"
        value={currentConnectionString.value}
        errorMessage={valueError}
        onChange={updateConnectionStringValue}
      />
      <DropdownNoFormik
        label={t('type')}
        id="connection-strings-form-type"
        widthOverride="100%"
        value={currentConnectionString.type}
        options={[
          {
            key: DatabaseType.MySql,
            text: typeValueToString(DatabaseType.MySql),
          },
          {
            key: DatabaseType.SQLServer,
            text: typeValueToString(DatabaseType.SQLServer),
          },
          {
            key: DatabaseType.SQLAzure,
            text: typeValueToString(DatabaseType.SQLAzure),
          },
          {
            key: DatabaseType.PostgreSQL,
            text: typeValueToString(DatabaseType.PostgreSQL),
          },
          {
            key: DatabaseType.Custom,
            text: typeValueToString(DatabaseType.Custom),
          },
        ]}
        onChange={updateConnectionStringType}
      />
      <Checkbox
        label={t('sticky')}
        id="connection-strings-form-sticky"
        defaultChecked={currentConnectionString.sticky}
        disabled={disableSlotSetting}
        onChange={updateConnectionStringSticky}
        styles={{
          root: formElementStyle,
        }}
      />
      {disableSlotSetting && (
        <div data-cy="connection-string-slot-setting-no-permission-message">
          <MessageBar messageBarType={MessageBarType.warning} isMultiline={true}>
            {t('slotSettingNoProdPermission')}
          </MessageBar>
        </div>
      )}
      <ActionBar
        id="connection-string-edit-footer"
        primaryButton={actionBarPrimaryButtonProps}
        secondaryButton={actionBarSecondaryButtonProps}
      />
    </form>
  );
};

export default ConnectionStringsAddEdit;
