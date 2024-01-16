import React from 'react';
import { FormikProps } from 'formik';
import { AppSettingsFormValues } from '../AppSettings.types';
import { useTranslation } from 'react-i18next';
import ErrorPageGrid from '../ErrorPages/ErrorPageGrid';
import { isEqual } from 'lodash-es';
import { Link } from '@fluentui/react';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { Links } from '../../../../utils/FwLinks';

const ErrorPagePivot: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { t } = useTranslation();

  return (
    <>
      <h3>{t('customErrorPage')}</h3>
      <p>
        <span id="default-documents-info-message">{t('errorPagesInfoMessage')}</span>
        <Link
          id="error-pages-info-learnMore"
          href={Links.customErrorPagesLearnMore}
          target="_blank"
          className={learnMoreLinkStyle}
          aria-labelledby="default-documents-info-message error-pages-info-learnMore">
          {` ${t('learnMore')}`}
        </Link>
      </p>
      <ErrorPageGrid {...props} />
    </>
  );
};

export default ErrorPagePivot;

export const errorPagesDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return !isEqual(values.errorPages, initialValues.errorPages);
};
