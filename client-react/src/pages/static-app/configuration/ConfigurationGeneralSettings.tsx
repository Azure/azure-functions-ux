import { Checkbox, IChoiceGroupOption, Link, MessageBarType, ProgressIndicator } from '@fluentui/react';
import { Field } from 'formik';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PortalContext } from '../../../PortalContext';
import CustomBanner from '../../../components/CustomBanner/CustomBanner';
import RadioButton from '../../../components/form-controls/RadioButton';
import TextField from '../../../components/form-controls/TextField';
import { learnMoreLinkStyle } from '../../../components/form-controls/formControl.override.styles';
import { TextFieldType } from '../../../utils/CommonConstants';
import { Links } from '../../../utils/FwLinks';
import { getTelemetryInfo, stringToPasswordProtectionType } from '../StaticSiteUtility';
import { useStyles } from './Configuration.styles';
import {
  ConfigurationGeneralSettingsProps,
  PasswordProtectionTypes,
  StagingEnvironmentPolicyTypes,
  StaticSiteSku,
} from './Configuration.types';

const ConfigurationGeneralSettings: React.FC<ConfigurationGeneralSettingsProps> = ({
  disabled,
  formProps,
  isLoading,
  staticSiteSku,
}: ConfigurationGeneralSettingsProps) => {
  const styles = useStyles();
  const portalContext = useContext(PortalContext);
  const { t } = useTranslation();
  const [passwordProtection, setPasswordProtection] = useState(PasswordProtectionTypes.Disabled);

  const passwordProtectionOptions = useMemo<IChoiceGroupOption[]>(
    () => [
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
    ],
    [t]
  );

  const onPasswordProtectionChange = useCallback(
    (_: React.FormEvent<HTMLElement>, option?: IChoiceGroupOption) => {
      if (option) {
        const newPasswordProtectionType = stringToPasswordProtectionType(option.key);
        formProps.setFieldValue('passwordProtection', newPasswordProtectionType);

        portalContext.log(
          getTelemetryInfo('info', 'passwordProtectionRadioButton', 'clicked', { passwordProtection: newPasswordProtectionType })
        );
      }
    },
    [formProps, portalContext]
  );

  const onStagingEnvironmentPolicyChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, checked: boolean = true) => {
      formProps.setFieldValue(
        'stagingEnvironmentPolicy',
        checked ? StagingEnvironmentPolicyTypes.Enabled : StagingEnvironmentPolicyTypes.Disabled
      );
    },
    [formProps]
  );

  const onAllowConfigFileUpdatesChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, checked: boolean = false) => {
      formProps.setFieldValue('allowConfigFileUpdates', checked);
    },
    [formProps]
  );

  const onVisitorPasswordChange = useCallback(
    (_: React.FormEvent<HTMLElement>, newPassword: string) => {
      formProps.setFieldValue('visitorPassword', newPassword);
    },
    [formProps]
  );

  const onVisitorPasswordConfirmChange = useCallback(
    (_: React.FormEvent<HTMLElement>, newConfirmPassword: string) => {
      formProps.setFieldValue('visitorPasswordConfirm', newConfirmPassword);
    },
    [formProps]
  );

  useEffect(() => {
    const isDirty =
      !!formProps.values.visitorPassword ||
      !!formProps.values.visitorPasswordConfirm ||
      formProps.values.passwordProtection !== formProps.initialValues.passwordProtection ||
      formProps.values.allowConfigFileUpdates !== formProps.initialValues.allowConfigFileUpdates ||
      formProps.values.stagingEnvironmentPolicy !== formProps.initialValues.stagingEnvironmentPolicy;
    formProps.setFieldValue('isGeneralSettingsDirty', isDirty);

    /** @note (joechung): Formik 1.x `formProps` do not work as a `useEffect` dependency. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formProps.values.visitorPassword,
    formProps.values.visitorPasswordConfirm,
    formProps.values.passwordProtection,
    formProps.values.allowConfigFileUpdates,
    formProps.values.stagingEnvironmentPolicy,
  ]);

  useEffect(() => {
    if (formProps.values.passwordProtection) {
      setPasswordProtection(formProps.values.passwordProtection);
    }
  }, [formProps.values.passwordProtection]);

  return (
    <div className={styles.formElement}>
      {isLoading ? (
        <ProgressIndicator description={t('staticSite_loadingGeneralSettings')} ariaValueText={t('staticSite_loadingGeneralSettings')} />
      ) : (
        <>
          <section className={styles.section}>
            <h3 className={styles.header}>{t('staticSite_passwordProtection')}</h3>

            {staticSiteSku === StaticSiteSku.Free && (
              <CustomBanner message={t('staticSite_passwordProtectionSkuWarning')} type={MessageBarType.info} />
            )}

            <div className={styles.description}>
              <span id="password-protection-message">{t('staticSite_passwordProtectionDescription')} </span>
              <Link
                aria-labelledby="password-protection-message"
                className={learnMoreLinkStyle}
                href={Links.staticSitePasswordProtectionLearnMore}
                target="_blank">
                {t('learnMore')}
              </Link>
            </div>

            <Field
              className={styles.textBox}
              component={RadioButton}
              customLabelClassName={styles.customLabel}
              customLabelStackClassName={styles.customLabelStack}
              disabled={disabled}
              displayInVerticalLayout
              id="staticSite_passwordProtection"
              label={t('staticSite_passwordProtection')}
              name="passwordProtection"
              onChange={onPasswordProtectionChange}
              optionStyles={styles.choiceGroupOption}
              options={passwordProtectionOptions}
              resizable
              selectedKey={passwordProtection}
              styles={styles.choiceGroup}
            />
            {passwordProtection !== PasswordProtectionTypes.Disabled && (
              <>
                <Field
                  className={styles.textBox}
                  component={TextField}
                  customLabelClassName={styles.customLabel}
                  customLabelStackClassName={styles.customLabelStack}
                  disabled={disabled}
                  id="password-protection-password"
                  label={t('staticSite_visitorPassword')}
                  name="visitorPassword"
                  onChange={onVisitorPasswordChange}
                  placeholder={t('staticSite_enterVisitorPassword')}
                  required
                  resizable
                  styles={styles.textField}
                  type={TextFieldType.password}
                  value={formProps.values.visitorPassword}
                />

                <Field
                  className={styles.textBox}
                  component={TextField}
                  customLabelClassName={styles.customLabel}
                  customLabelStackClassName={styles.customLabelStack}
                  disabled={disabled}
                  id="password-protection-confirm-password"
                  label={t('staticSite_confirmVisitorPassword')}
                  name="visitorPasswordConfirm"
                  onChange={onVisitorPasswordConfirmChange}
                  placeholder={t('staticSite_enterVisitorPassword')}
                  required
                  resizable
                  styles={styles.textField}
                  type={TextFieldType.password}
                  value={formProps.values.visitorPasswordConfirm}
                />
              </>
            )}
          </section>

          <section className={styles.section}>
            <h3 className={styles.header}>{t('staticSite_stagingEnvironments')}</h3>

            <div className={styles.description}>
              <span id="staging-env-description">{t('staticSite_stagingEnvironmentsDescription')} </span>
              <Link
                aria-labelledby="staging-env-description"
                className={learnMoreLinkStyle}
                href={Links.staticSiteStagingEnvironmentsLearnMore}
                id="staging-env-description-learnMore"
                target="_blank">
                {t('learnMore')}
              </Link>
            </div>

            <Field
              checked={formProps.values.stagingEnvironmentPolicy === StagingEnvironmentPolicyTypes.Enabled}
              component={Checkbox}
              customLabelClassName={styles.customLabel}
              customLabelStackClassName={styles.customLabelStack}
              disabled={disabled}
              id="enable-staging-environment-updates"
              label={t('staticSite_enableStagingEnvironments')}
              name="stagingEnvironmentPolicy"
              offText={t('no')}
              onChange={onStagingEnvironmentPolicyChange}
              onText={t('yes')}
              required
              styles={styles.toggle}
            />
          </section>

          <section className={styles.section}>
            <h3 className={styles.header}>{t('staticSite_configurationFile')}</h3>

            <div className={styles.description}>
              <span id="configuration-file-description">{t('staticSite_configurationFileDescription')} </span>
              <Link
                aria-labelledby="configuration-file-description"
                className={learnMoreLinkStyle}
                href={Links.staticSiteAllowConfigFileUpdatesLearnMore}
                id="configuration-file-description-learnMore"
                target="_blank">
                {t('learnMore')}
              </Link>
            </div>

            <Field
              checked={formProps.values.allowConfigFileUpdates}
              component={Checkbox}
              customLabelClassName={styles.customLabel}
              customLabelStackClassName={styles.customLabelStack}
              disabled={disabled}
              id="allow-config-file-updates"
              label={t('staticSite_configurationFileToggle')}
              name="allowConfigFileUpdates"
              offText={t('no')}
              onChange={onAllowConfigFileUpdatesChange}
              onText={t('yes')}
              required
              styles={styles.toggle}
            />
          </section>
        </>
      )}
    </div>
  );
};

export default ConfigurationGeneralSettings;
