import React, { useContext, useEffect } from 'react';
import { Field } from 'formik';
import { IChoiceGroupOption } from '@fluentui/react/lib/ChoiceGroup';
import { Link } from '@fluentui/react/lib/Link';
import { useTranslation } from 'react-i18next';
import { learnMoreLinkStyle } from '../../../components/form-controls/formControl.override.styles';
import { PortalContext } from '../../../PortalContext';
import { getTelemetryInfo, stringToPasswordProtectionType } from '../StaticSiteUtility';
import { ConfigurationGeneralSettingsProps, PasswordProtectionTypes } from './Configuration.types';
import { Links } from '../../../utils/FwLinks';
import { textboxStyle, formElementStyle, descriptionStyle, bannerWithPadding } from './Configuration.styles';
import { TextFieldType } from '../../../utils/CommonConstants';
import TextField from '../../../components/form-controls/TextField';
import RadioButton from '../../../components/form-controls/RadioButton';
import { MessageBarType } from '@fluentui/react/lib/MessageBar';
import CustomBanner from '../../../components/CustomBanner/CustomBanner';
import { StaticSiteSku } from '../skupicker/StaticSiteSkuPicker.types';

const ConfigurationGeneralSettings: React.FC<ConfigurationGeneralSettingsProps> = props => {
  const { disabled, formProps, staticSiteSku } = props;

  const portalContext = useContext(PortalContext);
  const { t } = useTranslation();

  const passwordProtectionOptions: IChoiceGroupOption[] = [
    {
      key: PasswordProtectionTypes.Disabled,
      text: t('staticSite_passwordProtectionDisabled'),
    },
    {
      key: PasswordProtectionTypes.StagingEnvironments,
      text: t('staticSite_passwordProtectionEnabledStaging'),
    },
    {
      key: PasswordProtectionTypes.AllEnvironments,
      text: t('staticSite_passwordProtectionEnabledProductionAndStaging'),
    },
  ];

  const getPasswordProtectionRadioButtons = () => {
    return (
      <Field
        className={textboxStyle}
        label={t('staticSite_passwordProtection')}
        id="staticSite_passwordProtection"
        name="passwordProtection"
        component={RadioButton}
        displayInVerticalLayout={true}
        options={passwordProtectionOptions}
        required={true}
        type={TextFieldType.password}
        widthOverride={'100%'}
        resizable={true}
        onChange={passwordProtectionRadioButtonOnChange}
        disabled={disabled}
      />
    );
  };

  const passwordProtectionRadioButtonOnChange = (_e: any, configOptions: IChoiceGroupOption) => {
    const newPasswordProtectionType = stringToPasswordProtectionType(configOptions.key);
    formProps.setFieldValue('passwordProtection', newPasswordProtectionType);

    portalContext.log(
      getTelemetryInfo('info', 'passwordProtectionRadioButton', 'clicked', { passwordProtection: newPasswordProtectionType })
    );
  };

  const changeTextFieldPassword = (e: any, newPassword: string) => {
    formProps.setFieldValue('visitorPassword', newPassword);
  };

  const changeTextFieldConfirmPassword = (e: any, newConfirmPassword: string) => {
    formProps.setFieldValue('visitorPasswordConfirm', newConfirmPassword);
  };

  const getPasswordProtectionDescription = () => {
    return (
      <div className={descriptionStyle}>
        {t('staticSite_passwordProtectionDescription')}
        <Link
          id="environment-variable-info-learnMore"
          href={Links.staticSiteEnvironmentVariablesLearnMore}
          target="_blank"
          className={learnMoreLinkStyle}
          aria-labelledby="environment-variable-info-message">
          {` ${t('learnMore')}`}
        </Link>
      </div>
    );
  };

  const getVisitorPasswordTextBox = () => {
    return (
      <Field
        className={textboxStyle}
        id="password-protection-password"
        name="visitorPassword"
        component={TextField}
        label={t('staticSite_visitorPassword')}
        placeholder={t('staticSite_enterVisitorPassword')}
        type={TextFieldType.password}
        widthOverride={'100%'}
        resizable={true}
        required={true}
        disabled={disabled}
        onChange={changeTextFieldPassword}
        value={formProps.values.visitorPassword}
      />
    );
  };

  const getVisitorPasswordConfirmTextBox = () => {
    return (
      <Field
        className={textboxStyle}
        id="password-protection-confirm-password"
        onChange={changeTextFieldConfirmPassword}
        name="visitorPasswordConfirm"
        component={TextField}
        label={t('staticSite_confirmVisitorPassword')}
        placeholder={t('staticSite_enterVisitorPassword')}
        type={TextFieldType.password}
        widthOverride={'100%'}
        resizable={true}
        required={true}
        disabled={disabled}
        value={formProps.values.visitorPasswordConfirm}
      />
    );
  };

  const getFreeSkuBanner = () => {
    const bannerInfo = { message: '', type: MessageBarType.info };
    if (staticSiteSku === StaticSiteSku.Free) {
      bannerInfo.message = t('staticSite_passwordProtectionSkuWarning');
    }
    return !!bannerInfo.message ? (
      <div className={bannerWithPadding}>
        {' '}
        <CustomBanner message={bannerInfo.message} type={bannerInfo.type} />
      </div>
    ) : (
      <></>
    );
  };

  const updateDirtyState = () => {
    const isDirty =
      !!formProps.values.visitorPassword ||
      !!formProps.values.visitorPasswordConfirm ||
      formProps.values.passwordProtection !== formProps.initialValues.passwordProtection;
    formProps.setFieldValue('isGeneralSettingsDirty', isDirty);
  };

  useEffect(() => {
    updateDirtyState();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.visitorPassword, formProps.values.visitorPasswordConfirm, formProps.values.passwordProtection]);

  return (
    <div className={formElementStyle}>
      <h3>{t('staticSite_passwordProtection')}</h3>
      {getFreeSkuBanner()}
      {getPasswordProtectionDescription()}
      {getPasswordProtectionRadioButtons()}
      {getVisitorPasswordTextBox()}
      {getVisitorPasswordConfirmTextBox()}
    </div>
  );
};

export default ConfigurationGeneralSettings;
