import React from 'react';
import { AppSettingsFormValues } from '../AppSettings.types';
import { FormikProps } from 'formik';

const FunctionRuntimeSettingsPivot: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  return null;
};

export const functionRuntimeSettingsDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return false;
};

export default FunctionRuntimeSettingsPivot;
