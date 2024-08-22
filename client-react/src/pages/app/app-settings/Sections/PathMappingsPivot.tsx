import React, { useContext, useRef } from 'react';
import { FormikProps } from 'formik';
import { AppSettingsFormValues } from '../AppSettings.types';
import { useTranslation } from 'react-i18next';
import HandlerMappings from '../HandlerMappings/HandlerMappings';
import VirtualApplications from '../VirtualApplications/VirtualApplications';
import { isEqual } from 'lodash-es';
import AzureStorageMounts from '../AzureStorageMounts/AzureStorageMounts';
import { PermissionsContext } from '../Contexts';
import { MessageBarType, Link } from '@fluentui/react';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { Links } from '../../../../utils/FwLinks';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { SiteStateContext } from '../../../../SiteState';

interface PathMappingsPivotProps {
  enablePathMappings: boolean;
  enableAzureStorageMount: boolean;
}
const PathMappingsPivot: React.FC<FormikProps<AppSettingsFormValues> & PathMappingsPivotProps> = props => {
  const { enablePathMappings, enableAzureStorageMount } = props;
  const { t } = useTranslation();
  const { app_write } = useContext(PermissionsContext);
  const siteState = useContext(SiteStateContext);
  const site = siteState && siteState.site;
  const scenarioCheckerRef = useRef(new ScenarioService(t));
  const scenarioChecker = scenarioCheckerRef.current!;

  const isAzureStorageMountNotInPreview =
    scenarioChecker.checkScenario(ScenarioIds.azureStorageMountPreview, { site }).status === 'disabled';

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
          <h3>{isAzureStorageMountNotInPreview ? t('mountStorage') : t('mountStoragePreview')}</h3>
          <p>
            <span id="mounted-storage-info">{t('mountedStorageInfo')}</span>
            <Link
              id="mounted-storage-info-learnMore"
              href={Links.mountedStorageLearnMore}
              target="_blank"
              className={learnMoreLinkStyle}
              aria-labelledby="mounted-storage-info mounted-storage-info-learnMore">
              {` ${t('learnMore')}`}
            </Link>
          </p>
          {app_write ? (
            <AzureStorageMounts {...props} />
          ) : (
            <div id="app-settings-storage-mount-rbac-message">
              <CustomBanner message={t('storageMountsNoPermissions')} type={MessageBarType.warning} undocked={true} />
            </div>
          )}
        </>
      )}
    </>
  );
};

export const pathMappingsDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return (
    !isEqual(values.virtualApplications, initialValues.virtualApplications) ||
    !isEqual(values.config.properties.handlerMappings, initialValues.config.properties.handlerMappings) ||
    !isEqual(values.azureStorageMounts, initialValues.azureStorageMounts)
  );
};

export default PathMappingsPivot;
