import React, { useEffect, useContext, useState } from 'react';
import { SiteStateContext } from '../../../../SiteState';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { ArmArray } from '../../../../models/arm-obj';
import {
  DeploymentProperties,
  DeploymentCenterFormData,
  DeploymentCenterCodeFormData,
  DeploymentCenterYupValidationSchemaType,
  DeploymentCenterDataLoaderProps,
} from '../DeploymentCenter.types';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterCodeFormBuilder } from '../code/DeploymentCenterCodeFormBuilder';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import DeploymentCenterCodeForm from './DeploymentCenterCodeForm';
import LogService from '../../../../utils/LogService';
import { getLogId } from '../utility/DeploymentCenterUtility';
import { LogCategories } from '../../../../utils/LogCategories';

const DeploymentCenterCodeDataLoader: React.FC<DeploymentCenterDataLoaderProps> = props => {
  const { resourceId } = props;
  const { t } = useTranslation();

  const siteStateContext = useContext(SiteStateContext);
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterCodeFormBuilder = new DeploymentCenterCodeFormBuilder(t);

  const [isLoading, setIsLoading] = useState(false);
  const [deployments, setDeployments] = useState<ArmArray<DeploymentProperties> | undefined>(undefined);
  const [deploymentsError, setDeploymentsError] = useState<string | undefined>(undefined);
  const [codeFormData, setCodeFormData] = useState<DeploymentCenterFormData<DeploymentCenterCodeFormData> | undefined>(undefined);
  const [codeFormValidationSchema, setCodeFormValidationSchema] = useState<
    DeploymentCenterYupValidationSchemaType<DeploymentCenterCodeFormData> | undefined
  >(undefined);

  const fetchData = async () => {
    LogService.trackEvent(LogCategories.deploymentCenter, getLogId('DeploymentCenterCodeDataLoader', 'fetchData'), {});

    const deploymentsResponse = await deploymentCenterData.getSiteDeployments(resourceId);

    if (deploymentsResponse.metadata.success) {
      setDeployments(deploymentsResponse.data);
    } else {
      const errorMessage = getErrorMessage(deploymentsResponse.metadata.error);
      setDeploymentsError(
        errorMessage ? t('deploymentCenterCodeDeploymentsFailedWithError').format(errorMessage) : t('deploymentCenterCodeDeploymentsFailed')
      );

      LogService.error(LogCategories.deploymentCenter, getLogId('DeploymentCenterCodeDataLoader', 'fetchData'), {
        error: deploymentsResponse.metadata.error,
      });
    }

    setIsLoading(false);
  };

  const generateForm = () => {
    if (deploymentCenterContext.siteConfig) {
      deploymentCenterCodeFormBuilder.setSiteConfig(deploymentCenterContext.siteConfig);
    }

    if (deploymentCenterContext.configMetadata) {
      deploymentCenterCodeFormBuilder.setConfigMetadata(deploymentCenterContext.configMetadata);
    }

    if (deploymentCenterContext.applicationSettings) {
      deploymentCenterCodeFormBuilder.setApplicationSettings(deploymentCenterContext.applicationSettings);
    }

    if (deploymentCenterPublishingContext.publishingUser) {
      deploymentCenterCodeFormBuilder.setPublishingUser(deploymentCenterPublishingContext.publishingUser);
    }

    const formData = deploymentCenterCodeFormBuilder.generateFormData();
    setCodeFormData(formData);
    setCodeFormValidationSchema(deploymentCenterCodeFormBuilder.generateYupValidationSchema());

    LogService.trackEvent(LogCategories.deploymentCenter, getLogId('DeploymentCenterCodeDataLoader', 'generateForm'), formData);
  };

  const refresh = () => {
    setIsLoading(true);
    fetchData();
    deploymentCenterContext.refresh();
  };

  useEffect(() => {
    fetchData();
    generateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteStateContext, deploymentCenterContext]);

  return (
    <DeploymentCenterCodeForm
      deployments={deployments}
      deploymentsError={deploymentsError}
      formData={codeFormData}
      formValidationSchema={codeFormValidationSchema}
      isLoading={isLoading}
      refresh={refresh}
    />
  );
};

export default DeploymentCenterCodeDataLoader;
