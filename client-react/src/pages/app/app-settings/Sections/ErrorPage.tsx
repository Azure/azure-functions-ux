import React from 'react';
import { FormikProps } from 'formik';
import { AppSettingsFormValues } from '../AppSettings.types';
import { useTranslation } from 'react-i18next';
import ErrorPageGrid from '../ErrorPages/ErrorPageGrid';
import { isEqual } from 'lodash-es';

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
