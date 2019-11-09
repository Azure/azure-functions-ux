import { FormikProps, Field } from 'formik';
import React, { useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormValues } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';
import TextField from '../../../../components/form-controls/TextField';
import { KeyCodes, MessageBar, MessageBarType } from 'office-ui-fabric-react';
// import { messageBannerStyle } from '../AppSettings.styles';
import { ThemeContext } from '../../../../ThemeContext';
import { style } from 'typestyle';

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
  const theme = useContext(ThemeContext);
  const disableAllControls = !app_write || !editable || saving;
  const showWarning = !values.site.properties.enabled && values.site.properties.siteDisabledReason === 1;

  if (!values.site) {
    return null;
  }

  return (
    <>
      {(true || showWarning) && (
        <MessageBar
          id="function-app-settings-daily-memory-time-quota-warning"
          isMultiline={false}
          className={style({
            backgroundColor: theme.semanticColors.warningBackground,
            paddingLeft: '5px',
          })}
          // className={messageBannerStyle(theme, MessageBarType.warning)}
          messageBarType={MessageBarType.warning}>
          {t('functionAppSettings_quotaWarning')}
        </MessageBar>
      )}
      <Field
        name="site.properties.dailyMemoryTimeQuota"
        dirty={values.site.properties.dailyMemoryTimeQuota !== initialValues.site.properties.dailyMemoryTimeQuota}
        component={TextField}
        onKeyPress={e => onKeyDown(e)}
        label={t('functionAppSettings_dailyUsageQuota')}
        id="function-app-settings-daily-memory-time-quota"
        disabled={disableAllControls}
        style={{ marginLeft: '1px', marginTop: '1px' }}
        infoBubbleMessage={t('functionAppSettings_quotaInfo')}
      />
    </>
  );
};

export default withTranslation('translation')(DailyUsageQuota);
