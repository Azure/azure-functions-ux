import { Checkbox, IDropdownOption } from '@fluentui/react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ActionBar from '../../../../components/ActionBar';
import { formElementStyle } from '../AppSettings.styles';
import { FormConnectionString } from '../AppSettings.types';
import { DatabaseType, typeValueToString } from './connectionStringTypes';
import { MessageBarType } from '@fluentui/react';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import DropdownNoFormik from '../../../../components/form-controls/DropDownnoFormik';
import { addEditFormStyle } from '../../../../components/form-controls/formControl.override.styles';
import { isLinuxApp } from '../../../../utils/arm-utils';
import { ArmObj } from '../../../../models/arm-obj';
import { Site } from '../../../../models/site/site';
import { ValidationRegex } from '../../../../utils/constants/ValidationRegex';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import ReferenceComponent from '../ReferenceComponent';
import { Reference } from '../../../../models/site/config';
import { CommonConstants, azureAppConfigRefStart } from '../../../../utils/CommonConstants';
import { getAllConnectionStringsReferences } from '../AppSettings.service';
import { PortalContext } from '../../../../PortalContext';
import { Links } from '../../../../utils/FwLinks';

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
  const [currentConnectionStringReference, setCurrentConnectionStringReference] = useState<Reference | undefined>(undefined);

  const { t } = useTranslation();

  const isLinux = isLinuxApp(site);

  const portalContext = useContext(PortalContext);

  const updateConnectionStringName = React.useCallback(
    (_e: any, name: string) => {
      setCurrentConnectionString({ ...currentConnectionString, name });
    },
    [currentConnectionString, setCurrentConnectionString]
  );

  const updateConnectionStringValue = React.useCallback(
    (_e: any, value: string) => {
      setCurrentConnectionString({ ...currentConnectionString, value });
    },
    [currentConnectionString, setCurrentConnectionString]
  );

  const updateConnectionStringType = React.useCallback(
    (e: any, typeOption: IDropdownOption) => {
      setCurrentConnectionString({ ...currentConnectionString, type: typeOption.key as string });
    },
    [currentConnectionString, setCurrentConnectionString]
  );

  const updateConnectionStringSticky = React.useCallback(
    (e: any, sticky: boolean) => {
      setCurrentConnectionString({ ...currentConnectionString, sticky });
    },
    [currentConnectionString, setCurrentConnectionString]
  );

  const save = () => {
    updateConnectionString(currentConnectionString);
  };

  const cancel = () => {
    closeBlade();
  };

  const isConnectionStringReferenceVisible = () => {
    return (
      connectionString.name === currentConnectionString.name &&
      connectionString.value === currentConnectionString.value &&
      currentConnectionStringReference &&
      currentConnectionString.name
    );
  };

  const isValidReference = () => {
    return (
      connectionString.name === currentConnectionString.name &&
      connectionString.value === currentConnectionString.value &&
      (CommonConstants.isKeyVaultReference(currentConnectionString.value) ||
        currentConnectionString.value.toLocaleLowerCase().startsWith(azureAppConfigRefStart))
    );
  };

  const getKeyVaultReference = async () => {
    // NOTE (krmitta): The backend API to get a single reference fails if the app-setting name contains special characters.
    // There will be a fix for that in ANT96 but in the meantime we need to use all the references and then get the one needed.
    const allKeyVaultReferences = await getAllConnectionStringsReferences(site.id);
    if (allKeyVaultReferences.metadata.success) {
      setCurrentConnectionStringReference(allKeyVaultReferences.data.properties.keyToReferenceStatuses[currentConnectionString.name]);
    } else {
      setCurrentConnectionStringReference(undefined);
      portalContext.log({
        action: 'getAllConnectionStringsReferences',
        actionModifier: 'failed',
        resourceId: site?.id,
        logLevel: 'error',
        data: {
          error: allKeyVaultReferences?.metadata.error,
          message: 'Failed to fetch key vault reference',
        },
      });
    }
  };

  const actionBarPrimaryButtonProps = {
    id: 'save',
    title: t('ok'),
    onClick: save,
    disable: !!nameError || !!valueError,
  };

  const actionBarSecondaryButtonProps = {
    id: 'cancel',
    title: t('cancel'),
    onClick: cancel,
    disable: false,
  };

  useEffect(() => {
    let nameErrorMessage = '';
    const { name, value } = currentConnectionString;

    if (!name) {
      nameErrorMessage = t('connectionStringPropIsRequired').format('Name');
    } else if (isLinux && ValidationRegex.appSettingName.test(name)) {
      nameErrorMessage = t('validation_linuxConnectionStringNameError');
    } else {
      nameErrorMessage = otherConnectionStrings.filter(v => v.name === name).length >= 1 ? t('connectionStringNamesUnique') : '';
    }
    setNameError(nameErrorMessage);
    setValueError(!value ? t('connectionStringPropIsRequired').format('Value') : '');
  }, [otherConnectionStrings, currentConnectionString.name, currentConnectionString.value]);

  useEffect(() => {
    if (isValidReference()) {
      getKeyVaultReference();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <form className={addEditFormStyle}>
        <TextFieldNoFormik
          label={t('nameRes')}
          widthOverride="100%"
          id="connection-strings-form-name"
          value={currentConnectionString.name}
          onChange={updateConnectionStringName}
          copyButton={true}
          errorMessage={nameError}
          autoFocus
        />
        <TextFieldNoFormik
          label={t('value')}
          widthOverride="100%"
          id="connection-strings-form-value"
          value={currentConnectionString.value}
          onChange={updateConnectionStringValue}
          copyButton={true}
          autoComplete={'off'}
          errorMessage={valueError}
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
          infoBubbleMessage={t('connectionStringInfoMessage')}
          learnMoreLink={Links.connectionStringLearnmore}
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
      {isConnectionStringReferenceVisible() && isValidReference() && currentConnectionStringReference && (
        <ReferenceComponent resourceId={site.id} appSettingReference={currentConnectionStringReference} />
      )}
    </>
  );
};

export default ConnectionStringsAddEdit;
