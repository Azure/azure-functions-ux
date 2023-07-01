import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';
import { isEqual } from 'lodash-es';

import { AppSettingsFormValues } from '../AppSettings.types';
import ErrorPageGrid from '../ErrorPages/ErrorPageGrid';

const ErrorPagePivot: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { t } = useTranslation();

  return (
    <>
      <h3>{t('customErrorPage')}</h3>
      <p id="default-documents-info-message">{t('errorPagesInfoMessage')}</p>
      <ErrorPageGrid {...props} />
    </>
  );
};

export default ErrorPagePivot;

export const errorPagesDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return !isEqual(values.errorPages, initialValues.errorPages);
};
