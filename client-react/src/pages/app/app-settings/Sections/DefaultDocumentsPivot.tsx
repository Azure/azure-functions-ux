import React from 'react';
import { FormikProps } from 'formik';
import { AppSettingsFormValues } from '../AppSettings.types';
import { InjectedTranslateProps, translate } from 'react-i18next';
import DefaultDocuments from '../DefaultDocuments/DefaultDocuments';
import { style } from 'typestyle';
import { isEqual } from 'lodash-es';
const defaultDocumentsWrapper = style({
  width: '565px',
});
const DefaultDocumentsPivot: React.FC<FormikProps<AppSettingsFormValues> & InjectedTranslateProps> = props => {
  const { t } = props;

  return (
    <>
      <h3>{t('defaultDocuments')}</h3>
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
export default translate('translation')(DefaultDocumentsPivot);
