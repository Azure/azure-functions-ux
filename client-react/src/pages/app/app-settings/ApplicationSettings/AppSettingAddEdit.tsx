import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import ActionBar from '../../../../components/ActionBar';
import { formElementStyle } from '../AppSettings.styles';
import { FormAppSetting } from '../AppSettings.types';
import { MessageBarType, Checkbox } from '@fluentui/react';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import { ArmObj } from '../../../../models/arm-obj';
import { Site } from '../../../../models/site/site';
import { getAllAppSettingReferences } from '../AppSettings.service';
import { Reference } from '../../../../models/site/config';
import { isLinuxApp } from '../../../../utils/arm-utils';
import { addEditFormStyle } from '../../../../components/form-controls/formControl.override.styles';
import { ValidationRegex } from '../../../../utils/constants/ValidationRegex';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { azureAppConfigRefStart, CommonConstants } from '../../../../utils/CommonConstants';
import ReferenceComponent from '../ReferenceComponent';
import { PortalContext } from '../../../../PortalContext';

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
  const [currentAppSettingReference, setCurrentAppSettingReference] = useState<Reference | undefined>(undefined);

  const isLinux = isLinuxApp(site);

  const portalContext = useContext(PortalContext);

  const { t } = useTranslation();

  const getReference = async () => {
    // NOTE (krmitta): The backend API to get a single reference fails if the app-setting name contains special characters.
    // There will be a fix for that in ANT96 but in the meantime we need to use all the references and then get the one needed.
    const allReferences = await getAllAppSettingReferences(site.id);
    if (allReferences.metadata.success) {
      const currentRefrence = allReferences.data.properties.keyToReferenceStatuses[currentAppSetting.name];
      if (site.properties.keyVaultReferenceIdentity) {
        if (site.properties.keyVaultReferenceIdentity.includes('userAssignedIdentities')) {
          currentRefrence.identityType = 'userassigned';
        }
      }
      setCurrentAppSettingReference(currentRefrence);
    } else {
      setCurrentAppSettingReference(undefined);
      portalContext.log({
        action: 'getAllAppSettingReferences',
        actionModifier: 'failed',
        resourceId: site?.id,
        logLevel: 'error',
        data: {
          error: allReferences?.metadata.error,
          message: 'Failed to fetch reference',
        },
      });
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
    return appSetting.name === currentAppSetting.name && appSetting.value === currentAppSetting.value && !!currentAppSettingReference;
  };

  const isValidReference = () => {
    return (
      appSetting.name === currentAppSetting.name &&
      appSetting.value === currentAppSetting.value &&
      (CommonConstants.isKeyVaultReference(currentAppSetting.value) ||
        appSetting.value.toLocaleLowerCase().startsWith(azureAppConfigRefStart))
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
    if (isValidReference()) {
      getReference();
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
          defaultChecked={!!currentAppSetting.sticky}
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
      {isAppSettingReferenceVisible() && isValidReference() && !!currentAppSettingReference && (
        <ReferenceComponent resourceId={site.id} appSettingReference={currentAppSettingReference} />
      )}
    </>
  );
};

export default AppSettingAddEdit;
