import React, { useEffect, useContext, useState } from 'react';
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
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import { SiteStateContext } from '../../../../SiteState';

const DeploymentCenterCodeDataLoader: React.FC<DeploymentCenterDataLoaderProps> = props => {
  const { resourceId, isDataRefreshing, tab } = props;
  const { t } = useTranslation();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const portalContext = useContext(PortalContext);
  const siteStateContext = useContext(SiteStateContext);

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterCodeFormBuilder = new DeploymentCenterCodeFormBuilder(t);

  const [isLogsDataRefreshing, setIsLogsDataRefreshing] = useState(false);
  const [deployments, setDeployments] = useState<ArmArray<DeploymentProperties> | undefined>(undefined);
  const [deploymentsError, setDeploymentsError] = useState<string | undefined>(undefined);
  const [codeFormData, setCodeFormData] = useState<DeploymentCenterFormData<DeploymentCenterCodeFormData> | undefined>(undefined);
  const [codeFormValidationSchema, setCodeFormValidationSchema] = useState<
    DeploymentCenterYupValidationSchemaType<DeploymentCenterCodeFormData> | undefined
  >(undefined);

  const fetchInitialLogsData = async () => {
    portalContext.log(
      getTelemetryInfo('info', 'initialDataRequest', 'submit', {
        publishType: 'code',
      })
    );
    setIsLogsDataRefreshing(true);
    await fetchDeploymentLogs();
    setIsLogsDataRefreshing(false);
  };

  const fetchDeploymentLogs = async () => {
    // NOTE(michinoy): We should prevent adding logs for this method. The reason is because it is called
    // on a frequency, currently it is set to 30 seconds.
    const deploymentsResponse = await deploymentCenterData.getSiteDeployments(resourceId);

    if (deploymentsResponse.metadata.success) {
      setDeployments(deploymentsResponse.data);
    } else if (!siteStateContext.isKubeApp) {
      const errorMessage = getErrorMessage(deploymentsResponse.metadata.error);
      setDeploymentsError(
        errorMessage ? t('deploymentCenterCodeDeploymentsFailedWithError').format(errorMessage) : t('deploymentCenterCodeDeploymentsFailed')
      );
    }
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

    if (deploymentCenterPublishingContext.basicPublishingCredentialsPolicies) {
      deploymentCenterCodeFormBuilder.setBasicPublishingCredentialsPolicies(
        deploymentCenterPublishingContext.basicPublishingCredentialsPolicies
      );
    }

    const formData = deploymentCenterCodeFormBuilder.generateFormData();
    setCodeFormData(formData);
    setCodeFormValidationSchema(deploymentCenterCodeFormBuilder.generateYupValidationSchema());

    // NOTE(michinoy): Prevent logging form data here as it could contain secrets (e.g. publishing password)
    portalContext.log(
      getTelemetryInfo('info', 'generateForm', 'generated', {
        publishType: 'code',
      })
    );
  };

  const refreshLogs = () => {
    fetchDeploymentLogs();
  };

  const refresh = () => {
    portalContext.log(
      getTelemetryInfo('info', 'refresh', 'submit', {
        publishType: 'code',
      })
    );

    fetchInitialLogsData();
    deploymentCenterContext.refresh();
  };

  useEffect(() => {
    if (deploymentCenterContext.resourceId) {
      fetchInitialLogsData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.resourceId]);

  useEffect(() => {
    if (deploymentCenterContext.applicationSettings && deploymentCenterContext.siteConfig && deploymentCenterContext.configMetadata) {
      generateForm();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.applicationSettings, deploymentCenterContext.siteConfig, deploymentCenterContext.configMetadata]);

  return (
    <DeploymentCenterCodeForm
      tab={tab}
      deployments={deployments}
      deploymentsError={deploymentsError}
      formData={codeFormData}
      formValidationSchema={codeFormValidationSchema}
      refresh={refresh}
      refreshLogs={refreshLogs}
      isDataRefreshing={isDataRefreshing}
      isLogsDataRefreshing={isLogsDataRefreshing}
    />
  );
};

export default DeploymentCenterCodeDataLoader;
