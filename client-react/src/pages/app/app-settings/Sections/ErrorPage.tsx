import React from 'react';
import { FormikProps } from 'formik';
import { AppSettingsFormValues } from '../AppSettings.types';
import { useTranslation } from 'react-i18next';
import ErrorPageGrid from '../ErrorPages/ErrorPageGrid';

const ErrorPage: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { t } = useTranslation();

  return (
      <>
        <h3>{t('customErrorPage')}</h3>
        <span id="default-documents-info-message">{t('errorPagesInfoMessage')}</span>
        <ErrorPageGrid {...props} />
      </>
  );
};

export default ErrorPage;
