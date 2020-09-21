import React, { useContext, useEffect, useState } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { LogCategories } from '../../../../utils/LogCategories';
import LogService from '../../../../utils/LogService';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { useTranslation } from 'react-i18next';
import { deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import { Link, Icon, MessageBarType } from 'office-ui-fabric-react';
import { AuthorizationResult, DeploymentCenterGitHubConfiguredViewProps } from '../DeploymentCenter.types';
import GitHubService from '../../../../ApiHelpers/GitHubService';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import DeploymentCenterGitHubDisconnect from './DeploymentCenterGitHubDisconnect';
import { SiteStateContext } from '../../../../SiteState';
import { authorizeWithProvider } from '../utility/DeploymentCenterUtility';

const DeploymentCenterGitHubConfiguredView: React.FC<DeploymentCenterGitHubConfiguredViewProps> = props => {
  const { t } = useTranslation();
  const { isGitHubActionsSetup } = props;
  const [org, setOrg] = useState<string | undefined>(undefined);
  const [repo, setRepo] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [repoUrl, setRepoUrl] = useState<string | undefined>(undefined);
  const [gitHubUsername, setGitHubUsername] = useState<string>(t('loading'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);
  const deploymentCenterData = new DeploymentCenterData();

  const getSourceControlDetails = async () => {
    setIsLoading(true);
    const getGitHubUserRequest = deploymentCenterData.getGitHubUser(deploymentCenterContext.gitHubToken);
    const getSourceControlDetailsResponse = deploymentCenterData.getSourceControlDetails(deploymentCenterContext.resourceId);

    const [gitHubUserResponse, sourceControlDetailsResponse] = await Promise.all([getGitHubUserRequest, getSourceControlDetailsResponse]);

    if (sourceControlDetailsResponse.metadata.success) {
      setRepoUrl(sourceControlDetailsResponse.data.properties.repoUrl);
      setBranch(sourceControlDetailsResponse.data.properties.branch);

      const repoUrlSplit = sourceControlDetailsResponse.data.properties.repoUrl.split('/');
      if (repoUrlSplit.length >= 2) {
        setOrg(repoUrlSplit[repoUrlSplit.length - 2]);
        setRepo(repoUrlSplit[repoUrlSplit.length - 1]);
      }
    } else {
      setRepoUrl(t('deploymentCenterErrorFetchingInfo'));
      setOrg(t('deploymentCenterErrorFetchingInfo'));
      setRepo(t('deploymentCenterErrorFetchingInfo'));
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterSourceControls',
        `Failed to get source control details with error: ${getErrorMessage(sourceControlDetailsResponse.metadata.error)}`
      );
    }

    if (gitHubUserResponse.metadata.success && gitHubUserResponse.data.login) {
      setGitHubUsername(gitHubUserResponse.data.login);
    } else {
      // NOTE(michinoy): if unsuccessful, assume the user needs to authorize.
      setGitHubUsername('');

      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterGitHubConfiguredView',
        `Failed to get GitHub user details with error: ${getErrorMessage(gitHubUserResponse.metadata.error)}`
      );
    }

    setIsLoading(false);
  };

  const authorizeGitHubAccount = () => {
    authorizeWithProvider(GitHubService.authorizeUrl, () => {}, completingAuthCallBack);
  };

  const completingAuthCallBack = (authorizationResult: AuthorizationResult) => {
    if (authorizationResult.redirectUrl) {
      deploymentCenterData
        .getGitHubToken(authorizationResult.redirectUrl)
        .then(response => {
          if (response.metadata.success) {
            return deploymentCenterData.storeGitHubToken(response.data);
          } else {
            // NOTE(michinoy): This is all related to the handshake between us and the provider.
            // If this fails, there isn't much the user can do except retry.

            LogService.error(
              LogCategories.deploymentCenter,
              'authorizeGitHubAccount',
              `Failed to get token with error: ${getErrorMessage(response.metadata.error)}`
            );

            return Promise.resolve(null);
          }
        })
        .then(() => getSourceControlDetails());
    } else {
      return getSourceControlDetails();
    }
  };

  const getSignedInAsComponent = () => {
    if (gitHubUsername) {
      return (
        <ReactiveFormControl id="deployment-center-github-user" label={t('deploymentCenterOAuthSingedInAs')}>
          <div>{`${gitHubUsername}`}</div>
        </ReactiveFormControl>
      );
    } else {
      return (
        <div className={deploymentCenterInfoBannerDiv}>
          <CustomBanner
            message={
              <>
                {`${t('deploymentCenterSettingsConfiguredViewGitHubNotAuthorized')} `}
                <Link onClick={authorizeGitHubAccount} target="_blank">
                  {t('authorize')}
                </Link>
              </>
            }
            type={MessageBarType.error}
          />
        </div>
      );
    }
  };

  const getBranchLink = () => {
    if (branch) {
      return (
        <Link key="deployment-center-branch-link" onClick={() => window.open(repoUrl, '_blank')} aria-label={`${branch}`}>
          {`${branch} `}
          <Icon id={`branch-button`} iconName={'NavigateExternalInline'} />
        </Link>
      );
    } else {
      return t('deploymentCenterErrorFetchingInfo');
    }
  };

  useEffect(() => {
    getSourceControlDetails();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isGitHubActionsSetup && (
        <ReactiveFormControl id="deployment-center-github-user" label={t('deploymentCenterSettingsSourceLabel')}>
          <div>
            {`${t('deploymentCenterCodeSettingsSourceGitHub')}`}
            {branch && org && repo && repoUrl && (
              <DeploymentCenterGitHubDisconnect branch={branch} org={org} repo={repo} repoUrl={repoUrl} />
            )}
          </div>
        </ReactiveFormControl>
      )}
      {siteStateContext.isContainerApp ? (
        <h3>{t('deploymentCenterContainerGitHubActionsTitle')}</h3>
      ) : (
        <h3>{t('deploymentCenterCodeGitHubTitle')}</h3>
      )}
      {isLoading ? (
        <ReactiveFormControl id="deployment-center-github-user" label={t('deploymentCenterOAuthSingedInAs')}>
          <div>{t('loading')}</div>
        </ReactiveFormControl>
      ) : (
        getSignedInAsComponent()
      )}
      <ReactiveFormControl id="deployment-center-organization" label={t('deploymentCenterOAuthOrganization')}>
        <div>{isLoading ? t('loading') : org}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-repository" label={t('deploymentCenterOAuthRepository')}>
        <div>{isLoading ? t('loading') : repo}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-github-branch" label={t('deploymentCenterOAuthBranch')}>
        <div>{isLoading ? t('loading') : getBranchLink()}</div>
      </ReactiveFormControl>
    </>
  );
};

export default DeploymentCenterGitHubConfiguredView;
