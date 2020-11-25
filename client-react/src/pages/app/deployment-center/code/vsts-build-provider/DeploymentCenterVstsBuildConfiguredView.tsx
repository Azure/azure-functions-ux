import { Icon, Link, MessageBarType } from 'office-ui-fabric-react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../../../ApiHelpers/ArmHelper';
import CustomBanner from '../../../../../components/CustomBanner/CustomBanner';
import ReactiveFormControl from '../../../../../components/form-controls/ReactiveFormControl';
import { KeyValue } from '../../../../../models/portal-models';
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
  const [vstsMetadata, setVstsMetadata] = useState<KeyValue<string> | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const fetchSiteConfig = async () => {
    setIsLoading(true);
    const siteConfigMetadataResponse = await deploymentCenterData.getConfigMetadata(deploymentCenterContext.resourceId);
    if (siteConfigMetadataResponse.metadata.success) {
      setVstsMetadata(siteConfigMetadataResponse.data.properties);
    } else {
      setBranch(t('deploymentCenterErrorFetchingInfo'));
      setIsLoading(false);
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterSiteConfigMetadata',
        `Failed to get site config metadata with error: ${getErrorMessage(siteConfigMetadataResponse.metadata.error)}`
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (vstsMetadata) {
      fetchBuildDef();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vstsMetadata]);

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
