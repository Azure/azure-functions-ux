import { IChoiceGroupOption } from '@fluentui/react/lib/ChoiceGroup';
import { Link } from '@fluentui/react/lib/Link';
import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { learnMoreLinkStyle } from '../../../components/form-controls/formControl.override.styles';
import { PortalContext } from '../../../PortalContext';
import { getTelemetryInfo, stringToPasswordProtectionType } from '../StaticSiteUtility';
import { ConfigurationGeneralSettingsProps, PasswordProtectionTypes } from './Configuration.types';
import { Links } from '../../../utils/FwLinks';
import { textboxStyle, formElementStyle, descriptionStyle } from './Configuration.styles';
import { TextFieldType } from '../../../utils/CommonConstants';
import { TextField } from '@fluentui/react/lib/TextField';
import { Field } from 'formik';
import RadioButton from '../../../components/form-controls/RadioButton';

const ConfigurationGeneralSettings: React.FC<ConfigurationGeneralSettingsProps> = props => {
  const { disabled, formProps } = props;

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
      <div className={formElementStyle}>
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
          onChange={PasswordProtectionRadioButtonOnChange}
          disabled={disabled}
        />
      </div>
    );
  };

  const PasswordProtectionRadioButtonOnChange = (_e: any, configOptions: IChoiceGroupOption) => {
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
      <div className={formElementStyle}>
        <Field
          className={textboxStyle}
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
      </div>
    );
  };

  const getVisitorPasswordConfirmTextBox = () => {
    return (
      <div className={formElementStyle}>
        <Field
          className={textboxStyle}
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
      </div>
    );
  };

  useEffect(() => {
    const isDirty =
      !!formProps.values.visitorPassword ||
      !!formProps.values.visitorPasswordConfirm ||
      formProps.values.passwordProtection !== formProps.initialValues.passwordProtection;
    formProps.setFieldValue('isGeneralSettingsDirty', isDirty);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.visitorPassword, formProps.values.visitorPasswordConfirm, formProps.values.passwordProtection]);

  return (
    <>
      <h3>{t('staticSite_passwordProtection')}</h3>
      {getPasswordProtectionDescription()}
      {getPasswordProtectionRadioButtons()}
      {getVisitorPasswordTextBox()}
      {getVisitorPasswordConfirmTextBox()}
    </>
  );
};

export default ConfigurationGeneralSettings;
