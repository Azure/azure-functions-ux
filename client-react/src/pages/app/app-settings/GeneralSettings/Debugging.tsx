import { Field, FormikProps } from 'formik';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import Dropdown from '../../../../components/form-controls/DropDown';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { AppSettingsFormValues } from '../AppSettings.types';
import { settingsWrapper } from '../AppSettingsForm';
import { PermissionsContext } from '../Contexts';

const Debug: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { t } = useTranslation();
  const { app_write } = useContext(PermissionsContext);
  return (
    <div id="app-settings-remote-debugging-section">
      <h3>{t('debugging')}</h3>
      <div className={settingsWrapper}>
        <Field
          name="config.properties.remoteDebuggingEnabled"
          component={RadioButton}
          fullpage
          label={t('remoteDebuggingEnabledLabel')}
          disabled={!app_write}
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
            component={Dropdown}
            fullpage
            disabled={!app_write}
            options={[
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

export default Debug;
