import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ActionBar from '../../../../components/ActionBar';
import { formElementStyle } from '../AppSettings.styles';
import { FormAppSetting } from '../AppSettings.types';
import { MessageBarType } from 'office-ui-fabric-react/lib';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import { ArmObj } from '../../../../models/arm-obj';
import { Site } from '../../../../models/site/site';
import { getApplicationSettingReference } from '../AppSettings.service';
import { KeyVaultReference } from '../../../../models/site/config';
import { isLinuxApp } from '../../../../utils/arm-utils';
import { addEditFormStyle } from '../../../../components/form-controls/formControl.override.styles';
import { ValidationRegex } from '../../../../utils/constants/ValidationRegex';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { getErrorMessageOrStringify } from '../../../../ApiHelpers/ArmHelper';
import { CommonConstants } from '../../../../utils/CommonConstants';
import KeyVaultReferenceComponent from '../KeyVaultReferenceComponent';

export interface AppSettingAddEditProps {
  updateAppSetting: (item: FormAppSetting) => void;
  closeBlade: () => void;
  otherAppSettings: FormAppSetting[];
  appSetting: FormAppSetting;
  disableSlotSetting: boolean;
  site: ArmObj<Site>;
}
const AppSettingAddEdit: React.SFC<AppSettingAddEditProps> = props => {
  const { updateAppSetting, otherAppSettings, closeBlade, appSetting, disableSlotSetting, site } = props;
  const [nameError, setNameError] = useState('');
  const [currentAppSetting, setCurrentAppSetting] = useState(appSetting);
  const [currentAppSettingReference, setCurrentAppSettingReference] = useState<
    ArmObj<{ [keyToReferenceStatuses: string]: { [key: string]: KeyVaultReference } }>
  >({
    id: '',
    name: '',
    type: '',
    location: '',
    properties: {
      keyToReferenceStatuses: {},
    },
  });

  const isLinux = isLinuxApp(site);

  const { t } = useTranslation();

  const getKeyVaultReference = async () => {
    const keyVaultReference = await getApplicationSettingReference(site.id, currentAppSetting.name);
    if (keyVaultReference.metadata.success) {
      setCurrentAppSettingReference(keyVaultReference.data);
    } else {
      LogService.error(
        LogCategories.appSettings,
        'getApplicationSettingKeyVaultReference',
        `Failed to get keyVault reference: ${getErrorMessageOrStringify(keyVaultReference.metadata.error)}`
      );
    }
  };

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
    if (isLinux && ValidationRegex.appSettingName.test(value)) {
      return t('validation_linuxAppSettingNameError');
    }
    return otherAppSettings.filter(v => v.name.toLowerCase() === value.toLowerCase()).length >= 1 ? t('appSettingNamesUnique') : '';
  };

  const isAppSettingReferenceVisible = () => {
    return (
      appSetting.name === currentAppSetting.name &&
      appSetting.value === currentAppSetting.value &&
      currentAppSettingReference &&
      currentAppSetting.name in currentAppSettingReference.properties.keyToReferenceStatuses
    );
  };

  const isValidKeyVaultReference = () => {
    return (
      appSetting.name === currentAppSetting.name &&
      appSetting.value === currentAppSetting.value &&
      CommonConstants.isKeyVaultReference(currentAppSetting.value)
    );
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
    disable: !!nameError || !currentAppSetting.name,
  };

  const actionBarSecondaryButtonProps = {
    id: 'cancel',
    title: t('cancel'),
    onClick: cancel,
    disable: false,
  };

  useEffect(() => {
    if (isValidKeyVaultReference()) {
      getKeyVaultReference();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <form className={addEditFormStyle}>
        <TextFieldNoFormik
          label={t('nameRes')}
          id="app-settings-edit-name"
          widthOverride="100%"
          value={currentAppSetting.name}
          errorMessage={nameError}
          onChange={updateAppSettingName}
          copyButton={true}
          autoFocus
        />
        <TextFieldNoFormik
          label={t('value')}
          id="app-settings-edit-value"
          widthOverride="100%"
          value={currentAppSetting.value}
          onChange={updateAppSettingValue}
          copyButton={true}
          autoComplete={'off'}
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
            <CustomBanner
              id="app-setting-slot-setting-no-permission-message"
              message={t('slotSettingNoProdPermission')}
              type={MessageBarType.warning}
              undocked={true}
            />
          </div>
        )}
        <ActionBar
          id="app-settings-edit-footer"
          primaryButton={actionBarPrimaryButtonProps}
          secondaryButton={actionBarSecondaryButtonProps}
        />
      </form>
      {isAppSettingReferenceVisible() && isValidKeyVaultReference() && (
        <KeyVaultReferenceComponent
          resourceId={site.id}
          appSettingReference={currentAppSettingReference.properties.keyToReferenceStatuses[currentAppSetting.name]}
        />
      )}
    </>
  );
};

export default AppSettingAddEdit;
