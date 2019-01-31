import React from 'react';
import { FormikProps } from 'formik';
import { AppSettingsFormValues } from '../AppSettings.types';
import { InjectedTranslateProps, translate } from 'react-i18next';
import HandlerMappings from '../HandlerMappings/HandlerMappings';
import VirtualApplications from '../VirtualApplications/VirtualApplications';
import { isEqual } from 'lodash-es';
import AzureStorageMounts from '../AzureStorageMounts/AzureStorageMounts';

interface PathMappingsPivotProps {
  enablePathMappings: boolean;
  enableAzureStorageMount: boolean;
}
const PathMappingsPivot: React.FC<FormikProps<AppSettingsFormValues> & InjectedTranslateProps & PathMappingsPivotProps> = props => {
  const { t, enablePathMappings, enableAzureStorageMount } = props;

  return (
    <>
      {enablePathMappings && (
        <>
          <h3>{t('handlerMappings')}</h3>
          <HandlerMappings {...props} />
          <h3>{t('virtualApplications')}</h3>
          <VirtualApplications {...props} />
        </>
      )}
      {enableAzureStorageMount && (
        <>
          <h3>{t('mountStorage')}</h3>
          <AzureStorageMounts {...props} />
        </>
      )}
    </>
  );
};

export const pathMappingsDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return (
    !isEqual(values.virtualApplications, initialValues.virtualApplications) ||
    !isEqual(values.config.properties.handlerMappings, initialValues.config.properties.handlerMappings)
  );
};

export default translate('translation')(PathMappingsPivot);
