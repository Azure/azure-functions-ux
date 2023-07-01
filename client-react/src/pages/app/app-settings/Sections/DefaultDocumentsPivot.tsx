import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';
import { isEqual } from 'lodash-es';
import { style } from 'typestyle';

import { AppSettingsFormValues } from '../AppSettings.types';
import DefaultDocuments from '../DefaultDocuments/DefaultDocuments';
const defaultDocumentsWrapper = style({
  width: '565px',
});
const DefaultDocumentsPivot: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { t } = useTranslation();
  return (
    <>
      <h3>{t('defaultDocuments')}</h3>
      <p>
        <span id="default-documents-info-message">{t('defaultDocumentsInfoMessage')}</span>
      </p>
      <div className={defaultDocumentsWrapper}>
        <DefaultDocuments {...props} />
      </div>
    </>
  );
};

export const defaultDocumentsDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return !isEqual(values.config.properties.defaultDocuments, initialValues.config.properties.defaultDocuments);
};

export const defaultDocumentsError = (errors: any) => {
  return errors && errors.config && errors.config.properties && !!errors.config.properties.defaultDocuments;
};
export default DefaultDocumentsPivot;
