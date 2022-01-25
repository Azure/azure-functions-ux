import { IChoiceGroupOption } from '@fluentui/react/lib/ChoiceGroup';
import { Link } from '@fluentui/react/lib/Link';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { learnMoreLinkStyle } from '../../../components/form-controls/formControl.override.styles';
import { PortalContext } from '../../../PortalContext';
import { getTelemetryInfo } from '../StaticSiteUtility';
import { ConfigurationGeneralSettingsProps, PasswordProtectionTypes } from './Configuration.types';
import { Links } from '../../../utils/FwLinks';
import { textboxStyle, descriptionStyle } from './Configuration.styles';
import TextFieldNoFormik from '../../../components/form-controls/TextFieldNoFormik';
import { TextFieldType } from '../../../utils/CommonConstants';
import RadioButtonNoFormik from '../../../components/form-controls/RadioButtonNoFormik';
import { Stack } from '@fluentui/react/lib/Stack';

const ConfigurationGeneralSettings: React.FC<ConfigurationGeneralSettingsProps> = props => {
  const [passwordProtection, setPasswordProtection] = useState<PasswordProtectionTypes>(PasswordProtectionTypes.Disabled);
  const [visitorPassword, setVisitorPassword] = useState<string>('');

  const portalContext = useContext(PortalContext);
  const { t } = useTranslation();

  const passwordProtectionOptions: IChoiceGroupOption[] = [
    {
      key: PasswordProtectionTypes.Disabled,
      text: t('staticSite_passwordProtectionDisabled'),
    },
    {
      key: PasswordProtectionTypes.StagingOnly,
      text: t('staticSite_passwordProtectionEnabledStaging'),
    },
    {
      key: PasswordProtectionTypes.StagingAndProduction,
      text: t('staticSite_passwordProtectionEnabledProductionAndStaging'),
    },
  ];

  const stringToPasswordProtectionType = (passwordProtection: string) => {
    switch (passwordProtection) {
      case PasswordProtectionTypes.StagingOnly:
        return PasswordProtectionTypes.StagingOnly;
      case PasswordProtectionTypes.StagingAndProduction:
        return PasswordProtectionTypes.StagingAndProduction;
      default:
        return PasswordProtectionTypes.Disabled;
    }
  };

  const getPasswordProtectionRadioButtons = () => {
    return (
      <Stack horizontal className={textboxStyle}>
        <RadioButtonNoFormik
          label={t('staticSite_passwordProtection')}
          id="staticSite_passwordProtection"
          aria-label={t('staticSite_passwordProtection')}
          selectedKey={passwordProtection}
          options={passwordProtectionOptions}
          required={true}
          onChange={PasswordProtectionRadioButtonOnChange}
          displayInVerticalLayout={true}
        />
      </Stack>
    );
  };

  const PasswordProtectionRadioButtonOnChange = (_e: any, configOptions: IChoiceGroupOption) => {
    const newPasswordProtectionType = stringToPasswordProtectionType(configOptions.key);
    setPasswordProtection(newPasswordProtectionType);
    portalContext.log(
      getTelemetryInfo('info', 'passwordProtectionRadioButton', 'clicked', { passwordProtection: newPasswordProtectionType })
    );
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

  const getPasswordProtectionTextBox = () => {
    return (
      <div className={textboxStyle}>
        <TextFieldNoFormik
          className={textboxStyle}
          id="deployment-center-ftps-application-password"
          label={t('staticSite_visitorPassword')}
          placeholder={t('staticSite_enterVisitorPassword')}
          widthOverride="100%"
          type={TextFieldType.password}
          value={visitorPassword}
          onChange={onPasswordChange}
        />
      </div>
    );
  };

  const onPasswordChange = (_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue: string) => {
    setVisitorPassword(newValue);
  };

  return (
    <>
      <h3>{t('staticSite_passwordProtection')}</h3>
      {getPasswordProtectionDescription()}
      {getPasswordProtectionRadioButtons()}
      {getPasswordProtectionTextBox()}
    </>
  );
};

export default ConfigurationGeneralSettings;
