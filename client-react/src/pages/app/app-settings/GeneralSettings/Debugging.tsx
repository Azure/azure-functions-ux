import * as React from 'react';
import { FormikProps, Field } from 'formik';
import { AppSettingsFormValues } from '../AppSettings.Types';
import Toggle from '../../../../components/form-controls/Toggle';
import Dropdown from '../../../../components/form-controls/DropDown';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { settingsWrapper } from '../AppSettingsForm';

const Debug: React.SFC<FormikProps<AppSettingsFormValues> & InjectedTranslateProps> = props => {
  const { t, values } = props;
  return (
    <div id="app-settings-remote-debugging-section">
      <h3>{t('debugging')}</h3>
      <div className={settingsWrapper}>
        <Field
          name="config.properties.remoteDebuggingEnabled"
          component={Toggle}
          label={t('remoteDebuggingEnabledLabel')}
          disabled={!values.siteWritePermission}
          id="remote-debugging-switch"
          onText={t('on')}
          offText={t('off')}
        />
        {props.values.config.properties.remoteDebuggingEnabled && (
          <Field
            name="config.properties.remoteDebuggingVersion"
            component={Dropdown}
            fullpage
            disabled={!values.siteWritePermission}
            options={[
              {
                key: 'VS2012',
                text: '2012',
              },
              {
                key: 'VS2015',
                text: '2015',
              },
              {
                key: 'VS2017',
                text: '2017',
              },
            ]}
            label={t('remoteDebuggingVersionLabel')}
            id="remote-debugging-version"
          />
        )}
      </div>
    </div>
  );
};

export default translate('translation')(Debug);
