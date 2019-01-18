import React from 'react';
import { FormikProps } from 'formik';
import { AppSettingsFormValues } from '../AppSettings.types';
import { InjectedTranslateProps, translate } from 'react-i18next';
import HandlerMappings from '../HandlerMappings/HandlerMappings';
import VirtualApplications from '../VirtualApplications/VirtualApplications';
import { isEqual } from 'lodash-es';
const DefaultDocumentsPivot: React.FC<FormikProps<AppSettingsFormValues> & InjectedTranslateProps> = props => {
  const { t } = props;

  return (
    <>
      <h3>{t('handlerMappings')}</h3>
      <HandlerMappings {...props} />
      <h3>{t('virtualApplications')}</h3>
      <VirtualApplications {...props} />
    </>
  );
};

export const pathMappingsDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return (
    !isEqual(values.virtualApplications, initialValues.virtualApplications) ||
    !isEqual(values.config.properties.handlerMappings, initialValues.config.properties.handlerMappings)
  );
};

export default translate('translation')(DefaultDocumentsPivot);
