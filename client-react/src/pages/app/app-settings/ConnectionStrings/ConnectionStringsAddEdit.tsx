import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ActionBar from '../../../../components/ActionBar';
import { formElementStyle } from '../AppSettings.styles';
import { FormConnectionString } from '../AppSettings.types';
import { DatabaseType, typeValueToString } from './connectionStringTypes';
import { MessageBarType } from 'office-ui-fabric-react/lib';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import DropdownNoFormik from '../../../../components/form-controls/DropDownnoFormik';
import { addEditFormStyle } from '../../../../components/form-controls/formControl.override.styles';
import { isLinuxApp } from '../../../../utils/arm-utils';
import { ArmObj } from '../../../../models/arm-obj';
import { Site } from '../../../../models/site/site';
import { ValidationRegex } from '../../../../utils/constants/ValidationRegex';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';

export interface ConnectionStringAddEditProps {
  updateConnectionString: (item: FormConnectionString) => any;
  closeBlade: () => void;
  otherConnectionStrings: FormConnectionString[];
  connectionString: FormConnectionString;
  disableSlotSetting: boolean;
  site: ArmObj<Site>;
}

const ConnectionStringsAddEdit: React.SFC<ConnectionStringAddEditProps> = props => {
  const { updateConnectionString, otherConnectionStrings, closeBlade, connectionString, disableSlotSetting, site } = props;
  const [nameError, setNameError] = useState('');
  const [valueError, setValueError] = useState('');
  const [currentConnectionString, setCurrentConnectionString] = useState(connectionString);
  const { t } = useTranslation();

  const isLinux = isLinuxApp(site);

  const validateConnectionStringName = (value: string) => {
    if (!value) {
      return t('connectionStringPropIsRequired').format('name');
    }
    if (isLinux && ValidationRegex.appSettingName.test(value)) {
      return t('validation_linuxConnectionStringNameError');
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
    const error = validateConnectionStringValue(value);
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
    disable: !!nameError || !currentConnectionString.name,
  };

  const actionBarSecondaryButtonProps = {
    id: 'cancel',
    title: t('cancel'),
    onClick: cancel,
    disable: false,
  };

  return (
    <form className={addEditFormStyle}>
      <TextFieldNoFormik
        label={t('nameRes')}
        widthOverride="100%"
        id="connection-strings-form-name"
        value={currentConnectionString.name}
        errorMessage={nameError}
        onChange={updateConnectionStringName}
        copyButton={true}
        autoFocus
      />
      <TextFieldNoFormik
        label={t('value')}
        widthOverride="100%"
        id="connection-strings-form-value"
        value={currentConnectionString.value}
        errorMessage={valueError}
        onChange={updateConnectionStringValue}
        copyButton={true}
      />
      <DropdownNoFormik
        label={t('type')}
        id="connection-strings-form-type"
        widthOverride="100%"
        selectedKey={currentConnectionString.type}
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
          <CustomBanner
            id="connection-string-slot-setting-no-permission-message"
            message={t('slotSettingNoProdPermission')}
            type={MessageBarType.warning}
            undocked={true}
          />
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
