import { Icon, Link, MessageBar, MessageBarType } from '@fluentui/react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { KeyValue } from '../../../../models/portal-models';
import { PortalContext } from '../../../../PortalContext';
import { getTelemetryInfo } from '../../../../utils/TelemetryUtils';
import DeploymentCenterData from '../DeploymentCenter.data';
import { deploymentCenterInfoBannerDiv, titleWithPaddingStyle } from '../DeploymentCenter.styles';
import {
  ContainerRegistrySources,
  DeploymentCenterCodeFormData,
  DeploymentCenterContainerFormData,
  DeploymentCenterFieldProps,
} from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterVstsDisconnect from './DeploymentCenterVstsDisconnect';
import { ThemeContext } from '../../../../ThemeContext';
import { messageBannerClass, messageBannerIconStyle } from '../../../../components/CustomBanner/CustomBanner.styles';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { ReactComponent as InfoSvg } from '../../../../images/Common/Info.svg';
import { SiteStateContext } from '../../../../SiteState';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';

const DeploymentCenterVstsBuildConfiguredView: React.FC<DeploymentCenterFieldProps<
  DeploymentCenterCodeFormData | DeploymentCenterContainerFormData
>> = ({ formProps }) => {
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  const [repo, setRepo] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [repoUrl, setRepoUrl] = useState<string | undefined>(undefined);
  const [project, setProject] = useState<string | undefined>(undefined);
  const [vstsAccountName, setVstsAccountName] = useState<string | undefined>(undefined);
  const [vstsMetadata, setVstsMetadata] = useState<KeyValue<string> | undefined>(undefined);
  const [showRepoInformation, setShowRepoInformation] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const deploymentCenterData = new DeploymentCenterData();
  const portalContext = useContext(PortalContext);
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);

  const fetchBuildDef = React.useCallback(async () => {
    if (vstsMetadata) {
      const buildDefinitionId = vstsMetadata['VSTSRM_BuildDefinitionId'];
      const buildDefinitionUrl: string = vstsMetadata['VSTSRM_BuildDefinitionWebAccessUrl'];

      if (buildDefinitionId) {
        setShowRepoInformation(true);
        let accountName = '';
        let buildDefinitionProjectUrl = '';

        if (buildDefinitionUrl) {
          accountName = getVSOAccountNameFromUrl(buildDefinitionUrl);
          buildDefinitionProjectUrl = buildDefinitionUrl.substring(0, buildDefinitionUrl.indexOf('/_build?'));
        } else {
          accountName = getVSOAccountNameFromUrl(vstsMetadata['VSTSRM_ConfiguredCDEndPoint']);
          buildDefinitionProjectUrl = `${deploymentCenterData.getAzureDevOpsUrl().Tfs}${accountName}/${vstsMetadata['VSTSRM_ProjectId']}`;
        }

        setVstsAccountName(accountName);

        const devOpsInfoResponse = await deploymentCenterData.getAzureDevOpsBuildDef(
          accountName,
          buildDefinitionProjectUrl,
          buildDefinitionId
        );
        if (devOpsInfoResponse.metadata.success && devOpsInfoResponse.data.repository && devOpsInfoResponse.data.project) {
          setRepoUrl(devOpsInfoResponse.data.repository.url);
          setRepo(devOpsInfoResponse.data.repository.name);
          setBranch(devOpsInfoResponse.data.repository.defaultBranch);
          setProject(devOpsInfoResponse.data.project.name);
        } else {
          setBranch(t('deploymentCenterErrorFetchingInfo'));
          portalContext.log(
            getTelemetryInfo('error', 'getAzureDevopsBuildDef', 'failed', {
              error: devOpsInfoResponse.metadata.error,
              message: 'Failed to get file content',
            })
          );
        }
      } else {
        setBranch(t('deploymentCenterErrorFetchingInfo'));
      }
      setIsLoading(false);
    }
  }, [vstsMetadata]);

  const getVSOAccountNameFromUrl = (url: string): string => {
    const devAzureCom: string = deploymentCenterData.getAzureDevOpsUrl().Tfs.replace(new RegExp('https://|/', 'gi'), '');
    const endpointUri = new URL(url);
    if (endpointUri.host.includes(devAzureCom)) {
      return endpointUri.pathname.split('/')[1];
    }
    return endpointUri.hostname.split('.')[0];
  };

  const getDevOpsProjectLink = () => {
    if (vstsAccountName && project) {
      return (
        <Link
          key="deployment-center-branch-link"
          onClick={() => window.open(`https://dev.azure.com/${vstsAccountName}/${project}`, '_blank')}
          aria-label={project}>
          {project}
          <Icon id={`repo-button`} iconName={'NavigateExternalInline'} />
        </Link>
      );
    }
  };

  const getRepoLink = () => {
    if (repoUrl) {
      return (
        <Link key="deployment-center-branch-link" onClick={() => window.open(repoUrl, '_blank')} aria-label={`${repo}`}>
          {`${repo} `}
          <Icon id={`repo-button`} iconName={'NavigateExternalInline'} />
        </Link>
      );
    }
    return t('deploymentCenterErrorFetchingInfo');
  };

  const isFormPropsContainerData = (
    values: DeploymentCenterCodeFormData | DeploymentCenterContainerFormData
  ): values is DeploymentCenterContainerFormData => {
    return !!(values as DeploymentCenterContainerFormData).registrySource;
  };

  const serverUrl = React.useMemo(() => {
    if (isFormPropsContainerData(formProps.values)) {
      switch (formProps.values.registrySource) {
        case ContainerRegistrySources.acr:
          return formProps.values.acrLoginServer;
        case ContainerRegistrySources.docker:
          return DeploymentCenterConstants.dockerHubServerUrl;
        case ContainerRegistrySources.privateRegistry:
          return formProps.values.privateRegistryServerUrl;
        default:
          return t('deploymentCenterErrorFetchingInfo');
      }
    }
  }, [formProps.values]);

  const image = React.useMemo(() => {
    if (isFormPropsContainerData(formProps.values)) {
      switch (formProps.values.registrySource) {
        case ContainerRegistrySources.acr:
          return formProps.values.acrImage;
        case ContainerRegistrySources.docker: {
          const imageAndTag = formProps.values.dockerHubImageAndTag.split(':');
          return imageAndTag.length > 0 ? imageAndTag[0] : '';
        }
        case ContainerRegistrySources.privateRegistry: {
          const imageAndTag = formProps.values.privateRegistryImageAndTag.split(':');
          return imageAndTag.length > 0 ? imageAndTag[0] : '';
        }
        default:
          return t('deploymentCenterErrorFetchingInfo');
      }
    }
  }, [formProps.values]);

  const tag = React.useMemo(() => {
    if (isFormPropsContainerData(formProps.values)) {
      switch (formProps.values.registrySource) {
        case ContainerRegistrySources.acr:
          return formProps.values.acrTag;
        case ContainerRegistrySources.docker: {
          const imageAndTag = formProps.values.dockerHubImageAndTag.split(':');
          return imageAndTag.length > 1 ? imageAndTag[1] : '';
        }
        case ContainerRegistrySources.privateRegistry: {
          const imageAndTag = formProps.values.privateRegistryImageAndTag.split(':');
          return imageAndTag.length > 1 ? imageAndTag[1] : '';
        }
        default:
          return t('deploymentCenterErrorFetchingInfo');
      }
    }
  }, [formProps.values]);

  useEffect(() => {
    if (deploymentCenterContext.configMetadata) {
      setVstsMetadata(deploymentCenterContext.configMetadata.properties);
    }
  }, [deploymentCenterContext.configMetadata]);

  useEffect(() => {
    fetchBuildDef();
  }, [fetchBuildDef]);

  return (
    <>
      <div className={deploymentCenterInfoBannerDiv}>
        <MessageBar
          id="deployment-center-vsts-info-message"
          tabIndex={0}
          messageBarType={MessageBarType.info}
          className={messageBannerClass(theme, MessageBarType.info)}>
          <span className={messageBannerIconStyle}>
            <InfoSvg />
          </span>
          <span>{t('deploymentCenterVstsInfoMessage')}</span>
          <span>
            <Link href={DeploymentCenterLinks.azureDevOpsPortal} target="_blank" aria-label={t('azureDevOpsPortal')}>
              {t('azureDevOpsPortal')}
            </Link>
          </span>
          <span>{t('deploymentCenterVstsInfoMessagePart2')}</span>
        </MessageBar>
      </div>

      <ReactiveFormControl id="deployment-center-azure-repos-source-label" label={t('deploymentCenterSettingsSourceLabel')}>
        <div>
          {`${t('deploymentCenterCodeSettingsSourceAzureRepos')}`}
          <DeploymentCenterVstsDisconnect formProps={formProps} />
        </div>
      </ReactiveFormControl>

      {showRepoInformation && (
        <>
          <h3>{t('deploymentCenterCodeAzureReposTitle')}</h3>
          <ReactiveFormControl id="deployment-center-vsts-project" label={t('deploymentCenterOAuthProject')}>
            <>{isLoading ? t('loading') : getDevOpsProjectLink()}</>
          </ReactiveFormControl>
          <ReactiveFormControl id="deployment-center-repository" label={t('deploymentCenterOAuthRepository')}>
            <div>{isLoading ? t('loading') : getRepoLink()}</div>
          </ReactiveFormControl>
          <ReactiveFormControl id="deployment-center-github-branch" label={t('deploymentCenterOAuthBranch')}>
            <div>{isLoading ? t('loading') : branch}</div>
          </ReactiveFormControl>
        </>
      )}

      {siteStateContext.isContainerApp && (
        <>
          <h3 className={titleWithPaddingStyle}>{t('deploymentCenterContainerRegistrySettingsTitle')}</h3>
          <ReactiveFormControl id="deployment-center-vsts-container-registry" label={t('containerServerURL')}>
            <>{isLoading ? t('loading') : serverUrl}</>
          </ReactiveFormControl>
          <ReactiveFormControl id="deployment-center-vsts-image" label={t('containerImageName')}>
            <div>{isLoading ? t('loading') : image}</div>
          </ReactiveFormControl>
          <ReactiveFormControl id="deployment-center-vsts-tag" label={t('containerACRTag')}>
            <div>{isLoading ? t('loading') : tag}</div>
          </ReactiveFormControl>
        </>
      )}
    </>
  );
};
export default DeploymentCenterVstsBuildConfiguredView;
