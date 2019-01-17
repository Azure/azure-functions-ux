import { Formik, FormikProps } from 'formik';
import * as React from 'react';
import { style } from 'typestyle';

import { AppSettingsFormValues } from './AppSettings.types';
import AppSettingsCommandBar from './AppSettingsCommandBar';
import AppSettingsDataLoader from './AppSettingsDataLoader';
import AppSettingsForm from './AppSettingsForm';

const formStyle = style({
  padding: '5px 20px',
});

const AppSettings: React.SFC<void> = () => {
  return (
    <AppSettingsDataLoader>
      {({ initialFormValues, saving, loading, onSubmit }) => (
        <Formik
          initialValues={initialFormValues}
          onSubmit={onSubmit}
          enableReinitialize={true}
          validateOnBlur={false}
          validateOnChange={false}>
          {(formProps: FormikProps<AppSettingsFormValues>) => (
            <form>
              <AppSettingsCommandBar
                submitForm={formProps.submitForm}
                resetForm={formProps.resetForm}
                disabled={!formProps.values.siteWritePermission || saving || loading}
                dirty={formProps.dirty}
              />
              <div className={formStyle}>
                <AppSettingsForm {...formProps} />
              </div>
            </form>
          )}
        </Formik>
      )}
    </AppSettingsDataLoader>
  );
};

export default AppSettings;
