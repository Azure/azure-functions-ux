import { Field, FormikProps } from 'formik';
import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../components/form-controls/DropDown';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { AppSettingsFormValues } from '../AppSettings.types';
import { settingsWrapper } from '../AppSettingsForm';
import { PermissionsContext } from '../Contexts';
import { MessageBarType, IDropdownOption } from '@fluentui/react';
import SiteHelper from '../../../../utils/SiteHelper';
import { Links } from '../../../../utils/FwLinks';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';

const DebuggingWindows: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { t } = useTranslation();
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const [flexStamp, setFlexStamp] = useState(false);
  const { values, initialValues } = props;

  const getExpiredVSVersionText = () => {
    const version = initialValues.config.properties.remoteDebuggingVersion ?? '';
    return version.startsWith('VS') ? version.slice(2) : version;
  };

  const options: IDropdownOption[] = [
    {
      key: 'VS2022',
      text: '2022',
    },
  ];

  if (initialValues.config.properties.remoteDebuggingVersion && initialValues.config.properties.remoteDebuggingVersion !== 'VS2022') {
    options.unshift({
      key: initialValues.config.properties.remoteDebuggingVersion,
      text: getExpiredVSVersionText(),
      disabled: true,
    });
  }

  const showWarningForVSVersion =
    values.config.properties.remoteDebuggingVersion &&
    values.config.properties.remoteDebuggingVersion !== 'VS2022' &&
    values.config.properties.remoteDebuggingEnabled;

  useEffect(() => {
    setFlexStamp(SiteHelper.isFlexStamp(values.site));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.site.properties.possibleInboundIpAddresses]);

  return (
    <div id="app-settings-remote-debugging-section">
      <h3>{t('debugging')}</h3>
      {showWarningForVSVersion && (
        <CustomBanner
          message={t('remoteDebuggingVSVersionNotSupported').format(getExpiredVSVersionText())}
          type={MessageBarType.warning}
          undocked={true}
        />
      )}
      <div className={settingsWrapper}>
        <Field
          name="config.properties.remoteDebuggingEnabled"
          dirty={values.config.properties.remoteDebuggingEnabled !== initialValues.config.properties.remoteDebuggingEnabled}
          component={RadioButton}
          fullpage
          label={t('remoteDebuggingEnabledLabel')}
          disabled={disableAllControls || flexStamp}
          infoBubbleMessage={flexStamp && t('remoteDebuggingNotAvailableOnFlexStamp')}
          learnMoreLink={flexStamp && Links.remoteDebuggingLearnMore}
          id="remote-debugging-switch"
          options={[
            {
              key: true,
              text: t('on'),
            },
            {
              key: false,
              text: t('off'),
            },
          ]}
        />
        {props.values.config.properties.remoteDebuggingEnabled && (
          <Field
            name="config.properties.remoteDebuggingVersion"
            dirty={
              values.config.properties.remoteDebuggingEnabled !== initialValues.config.properties.remoteDebuggingEnabled ||
              values.config.properties.remoteDebuggingVersion !== initialValues.config.properties.remoteDebuggingVersion
            }
            component={Dropdown}
            disabled={disableAllControls}
            options={options}
            label={t('remoteDebuggingVersionLabel')}
            id="remote-debugging-version"
          />
        )}
      </div>
    </div>
  );
};

export default DebuggingWindows;
