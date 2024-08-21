import React, { useEffect, useContext, useState } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { ArmArray } from '../../../../models/arm-obj';
import {
  DeploymentProperties,
  DeploymentCenterFormData,
  DeploymentCenterCodeFormData,
  DeploymentCenterYupValidationSchemaType,
  DeploymentCenterDataLoaderProps,
  GitHubActionsRun,
} from '../DeploymentCenter.types';
import { DeploymentCenterCodeFormBuilder } from '../code/DeploymentCenterCodeFormBuilder';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterPublishingContext } from '../authentication/DeploymentCenterPublishingContext';
import DeploymentCenterCodeForm from './DeploymentCenterCodeForm';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import { SiteStateContext } from '../../../../SiteState';

const DeploymentCenterCodeDataLoader: React.FC<DeploymentCenterDataLoaderProps> = props => {
  const { isDataRefreshing, tab } = props;
  const { t } = useTranslation();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);

  const deploymentCenterCodeFormBuilder = new DeploymentCenterCodeFormBuilder(t);

  const [deployments, setDeployments] = useState<ArmArray<DeploymentProperties> | undefined>(undefined);
  const [runs, setRuns] = useState<GitHubActionsRun[] | undefined>(undefined);
  const [codeFormData, setCodeFormData] = useState<DeploymentCenterFormData<DeploymentCenterCodeFormData> | undefined>(undefined);
  const [codeFormValidationSchema, setCodeFormValidationSchema] = useState<
    DeploymentCenterYupValidationSchemaType<DeploymentCenterCodeFormData> | undefined
  >(undefined);

  const generateForm = () => {
    if (siteStateContext?.site) {
      deploymentCenterCodeFormBuilder.setSite(siteStateContext.site);
    }

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

  const refresh = () => {
    portalContext.log(
      getTelemetryInfo('info', 'refresh', 'submit', {
        publishType: 'code',
      })
    );
    deploymentCenterContext.refresh();
  };

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
      runs={runs}
      setDeployments={setDeployments}
      setRuns={setRuns}
      formData={codeFormData}
      formValidationSchema={codeFormValidationSchema}
      refresh={refresh}
      isDataRefreshing={isDataRefreshing}
    />
  );
};

export default DeploymentCenterCodeDataLoader;
