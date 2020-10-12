import { Icon, Link, MessageBarType } from 'office-ui-fabric-react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../../../ApiHelpers/ArmHelper';
import AzureDevOpsService from '../../../../../AzureDevOpsService';
import CustomBanner from '../../../../../components/CustomBanner/CustomBanner';
import ReactiveFormControl from '../../../../../components/form-controls/ReactiveFormControl';
import { LogCategories } from '../../../../../utils/LogCategories';
import LogService from '../../../../../utils/LogService';
import DeploymentCenterData from '../../DeploymentCenter.data';
import { deploymentCenterInfoBannerDiv } from '../../DeploymentCenter.styles';
import { DeploymentCenterContext } from '../../DeploymentCenterContext';

const DeploymentCenterVstsBuildConfiguredView: React.FC<{}> = props => {
  const { t } = useTranslation();

  const [repo, setRepo] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [repoUrl, setRepoUrl] = useState<string | undefined>(undefined);
  const [vstsAccountName, setVstsAccountName] = useState<string>(t('loading'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const fetchData = async () => {
    setIsLoading(true);
    const siteConfigMetadataResponse = await deploymentCenterData.getConfigMetadata(deploymentCenterContext.resourceId);
    if (siteConfigMetadataResponse.metadata.success) {
      const vstsMetaData = siteConfigMetadataResponse.data.properties;
      const buildDefinitionId = vstsMetaData['VSTSRM_BuildDefinitionId'];
      const buildDefinitionUrl: string = vstsMetaData['VSTSRM_BuildDefinitionWebAccessUrl'];

      if (buildDefinitionId) {
        let accountName = '';
        let buildDefinitionProjectUrl = '';

        if (buildDefinitionUrl) {
          accountName = getVSOAccountNameFromUrl(buildDefinitionUrl);
          buildDefinitionProjectUrl = buildDefinitionUrl.substring(0, buildDefinitionUrl.indexOf('/_build?'));
        } else {
          accountName = getVSOAccountNameFromUrl(vstsMetaData['VSTSRM_ConfiguredCDEndPoint']);
          buildDefinitionProjectUrl = `${AzureDevOpsService.getAzureDevOpsUrl().Tfs}${accountName}/${vstsMetaData['VSTSRM_ProjectId']}`;
        }
        setVstsAccountName(accountName);
        await fetchBuildDef(accountName, buildDefinitionProjectUrl, buildDefinitionId);
      }
    } else {
      setBranch(t('deploymentCenterErrorFetchingInfo'));
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterSiteConfigMetadata',
        `Failed to get site config metadata with error: ${getErrorMessage(siteConfigMetadataResponse.metadata.error)}`
      );
    }
    setIsLoading(false);
  };

  const fetchBuildDef = async (accountName: string, buildDefinitionProjectUrl: string, buildDefinitionId: string) => {
    const devOpsInfoResponse = await AzureDevOpsService.getBuildDef(accountName, buildDefinitionProjectUrl, buildDefinitionId);
    if (devOpsInfoResponse.metadata.success && devOpsInfoResponse.data.repository) {
      setRepoUrl(devOpsInfoResponse.data.repository.url);
      setRepo(devOpsInfoResponse.data.repository.name);
      setBranch(devOpsInfoResponse.data.repository.defaultBranch);
    } else {
      setBranch(t('deploymentCenterErrorFetchingInfo'));
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterSiteConfigMetadata',
        `Failed to get dev ops information with error: ${getErrorMessage(devOpsInfoResponse.metadata.error)}`
      );
    }
  };

  const getVSOAccountNameFromUrl = (url: string): string => {
    const devAzureCom: string = AzureDevOpsService.getAzureDevOpsUrl().Tfs.replace(new RegExp('https://|/', 'gi'), '');
    const endpointUri = new URL(url);
    if (endpointUri.host.includes(devAzureCom)) {
      return endpointUri.pathname.split('/')[1];
    }
    return endpointUri.hostname.split('.')[0];
  };

  const getRepoLink = () => {
    if (repoUrl) {
      return (
        <Link key="deployment-center-branch-link" onClick={() => window.open(repoUrl, '_blank')} aria-label={`${repo}`}>
          {`${repo} `}
          <Icon id={`repo-button`} iconName={'NavigateExternalInline'} />
        </Link>
      );
    } else {
      return t('deploymentCenterErrorFetchingInfo');
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={deploymentCenterInfoBannerDiv}>
        <CustomBanner message={`${t('deploymentCenterVstsInfoMessage')} `} type={MessageBarType.info} />
      </div>

      <h3>{t('deploymentCenterCodeAzureReposTitle')}</h3>

      <ReactiveFormControl id="deployment-center-vsts-user" label={t('deploymentCenterOAuthSingedInAs')}>
        <>{vstsAccountName}</>
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
