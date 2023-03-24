import { Icon, Link, MessageBarType } from '@fluentui/react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { KeyValue } from '../../../../models/portal-models';
import { PortalContext } from '../../../../PortalContext';
import { getTelemetryInfo } from '../../../../utils/TelemetryUtils';
import DeploymentCenterData from '../DeploymentCenter.data';
import { deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import { DeploymentCenterCodeFormData, DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterVstsDisconnect from './DeploymentCenterVstsDisconnect';

const DeploymentCenterVstsBuildConfiguredView: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = ({ formProps }) => {
  const { t } = useTranslation();

  const [repo, setRepo] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [repoUrl, setRepoUrl] = useState<string | undefined>(undefined);
  const [project, setProject] = useState<string | undefined>(undefined);
  const [vstsAccountName, setVstsAccountName] = useState<string | undefined>(undefined);
  const [vstsMetadata, setVstsMetadata] = useState<KeyValue<string> | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const deploymentCenterData = new DeploymentCenterData();
  const portalContext = useContext(PortalContext);
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const fetchSiteConfig = async () => {
    setIsLoading(true);
    const siteConfigMetadataResponse = await deploymentCenterData.getConfigMetadata(deploymentCenterContext.resourceId);
    if (siteConfigMetadataResponse.metadata.success) {
      setVstsMetadata(siteConfigMetadataResponse.data.properties);
    } else {
      setBranch(t('deploymentCenterErrorFetchingInfo'));
      setIsLoading(false);
      portalContext.log(
        getTelemetryInfo('error', 'getSiteConfig', 'failed', {
          error: siteConfigMetadataResponse.metadata.error,
          message: 'Failed to get site config metadata with error',
        })
      );
    }
  };

  const fetchBuildDef = async () => {
    if (vstsMetadata) {
      const buildDefinitionId = vstsMetadata['VSTSRM_BuildDefinitionId'];
      const buildDefinitionUrl: string = vstsMetadata['VSTSRM_BuildDefinitionWebAccessUrl'];

      if (buildDefinitionId) {
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
  };

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

  useEffect(() => {
    fetchSiteConfig();
  }, []);

  useEffect(() => {
    if (vstsMetadata) {
      fetchBuildDef();
    }
  }, [vstsMetadata]);

  return (
    <>
      <div className={deploymentCenterInfoBannerDiv}>
        <CustomBanner
          id="deployment-center-vsts-info-message"
          message={`${t('deploymentCenterVstsInfoMessage')} `}
          type={MessageBarType.info}
        />
      </div>

      <ReactiveFormControl id="deployment-center-azure-repos-source-label" label={t('deploymentCenterSettingsSourceLabel')}>
        <div>
          {`${t('deploymentCenterCodeSettingsSourceAzureRepos')}`}
          <DeploymentCenterVstsDisconnect formProps={formProps} />
        </div>
      </ReactiveFormControl>

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
  );
};
export default DeploymentCenterVstsBuildConfiguredView;
