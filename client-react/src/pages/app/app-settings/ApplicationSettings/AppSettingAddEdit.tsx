import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import ActionBar from '../../../../components/ActionBar';
import { formElementStyle } from '../AppSettings.styles';
import { FormAppSetting } from '../AppSettings.types';
import { MessageBarType, MessageBar } from 'office-ui-fabric-react/lib';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import AppSettingReference from './AppSettingReference';
import { ArmObj } from '../../../../models/arm-obj';
import { Site } from '../../../../models/site/site';
import { fetchApplicationSettingReference } from '../AppSettings.service';
import { KeyVaultReference } from '../../../../models/site/config';

export interface AppSettingAddEditProps {
  updateAppSetting: (item: FormAppSetting) => void;
  closeBlade: () => void;
  otherAppSettings: FormAppSetting[];
  appSetting: FormAppSetting;
  disableSlotSetting: boolean;
  isLinux: boolean;
  site: ArmObj<Site>;
}
const AppSettingAddEdit: React.SFC<AppSettingAddEditProps> = props => {
  const { updateAppSetting, otherAppSettings, closeBlade, appSetting, disableSlotSetting, isLinux, site } = props;
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

  const { t } = useTranslation();

  const fetchAppSettingReference = async () => {
    const appSettingReference = await fetchApplicationSettingReference(site.id, currentAppSetting.name);
    if (appSettingReference.metadata.success) {
      setCurrentAppSettingReference(appSettingReference.data);
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
    if (isLinux && /[^\w\.]/.test(value)) {
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

  const isAppSettingValidReference = () => {
    return (
      appSetting.name === currentAppSetting.name &&
      appSetting.value === currentAppSetting.value &&
      currentAppSetting.value.startsWith('@Microsoft.KeyVault(')
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
    disable: !!nameError,
  };

  const actionBarSecondaryButtonProps = {
    id: 'cancel',
    title: t('cancel'),
    onClick: cancel,
    disable: false,
  };

  useEffect(() => {
    if (isAppSettingValidReference()) {
      fetchAppSettingReference();
    }
  }, []);
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
      {isAppSettingReferenceVisible() && isAppSettingValidReference() && (
        <AppSettingReference appSettingReference={currentAppSettingReference.properties.keyToReferenceStatuses[currentAppSetting.name]} />
      )}
    </>
  );
};

export default AppSettingAddEdit;
