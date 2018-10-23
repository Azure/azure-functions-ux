import * as React from 'react';
import { FormikProps, Field } from 'formik';
import { AppSettingsFormValues } from '../AppSettings.Types';
import Toggle from '../../../../components/form-controls/Toggle';
import Dropdown from '../../../../components/form-controls/DropDown';
import { InjectedTranslateProps, translate } from 'react-i18next';

const Debug: React.SFC<FormikProps<AppSettingsFormValues> & InjectedTranslateProps> = props => {
  const { t } = props;
  return (
    <>
      <Field
        name="config.properties.remoteDebuggingEnabled"
        component={Toggle}
        label={t('remoteDebuggingEnabledLabel')}
        id="remote-debugging-switch"
        onText={t('on')}
        offText={t('off')}
      />
      {props.values.config.properties.remoteDebuggingEnabled && (
        <Field
          name="config.properties.remoteDebuggingVersion"
          component={Dropdown}
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
    </>
  );
};

export default translate()(Debug);
