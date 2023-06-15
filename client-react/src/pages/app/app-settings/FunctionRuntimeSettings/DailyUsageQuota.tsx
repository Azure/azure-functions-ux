import { KeyCodes, MessageBarType } from '@fluentui/react';
import { Field, FormikProps } from 'formik';
import React, { useContext } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import TextField from '../../../../components/form-controls/TextField';
import { SiteDisabledReason } from '../../../../models/site/site';
import { AppSettingsFormValues } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';

const onKeyDown = keyEvent => {
  const keyCode = keyEvent.charCode || keyEvent.keyCode;
  const isNumber = keyCode >= KeyCodes.zero && keyCode <= KeyCodes.nine;
  const isNumPadNumber = keyCode >= KeyCodes.zero_numpad && keyCode <= KeyCodes.nine_numpad;

  if (!isNumber && !isNumPadNumber) {
    keyEvent.preventDefault();
  }
};

const DailyUsageQuota: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  const { t, values, initialValues } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const showWarning =
    !values.site.properties.enabled && values.site.properties.siteDisabledReason === SiteDisabledReason.FunctionQuotaExceeded;

  return (
    <>
      {showWarning && (
        <CustomBanner
          id="function-app-settings-daily-memory-time-quota-warning"
          message={t('functionAppSettings_quotaWarning')}
          type={MessageBarType.warning}
          undocked={true}
        />
      )}
      <Field
        name="site.properties.dailyMemoryTimeQuota"
        dirty={values.site.properties.dailyMemoryTimeQuota !== initialValues.site.properties.dailyMemoryTimeQuota}
        component={TextField}
        onKeyPress={e => onKeyDown(e)}
        label={t('functionAppSettings_dailyUsageQuota')}
        id="function-app-settings-daily-memory-time-quota"
        disabled={disableAllControls}
        infoBubbleMessage={t('functionAppSettings_quotaInfo')}
        widthOverride="275px"
      />
    </>
  );
};

export default withTranslation('translation')(DailyUsageQuota);
