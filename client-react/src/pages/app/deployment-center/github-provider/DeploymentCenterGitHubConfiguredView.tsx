import React, { useContext, useEffect, useState } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { useTranslation } from 'react-i18next';
import { deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import { Link, Icon, MessageBarType } from 'office-ui-fabric-react';
import {
  AuthorizationResult,
  DeploymentCenterFieldProps,
  DeploymentCenterCodeFormData,
  DeploymentCenterContainerFormData,
} from '../DeploymentCenter.types';
import GitHubService from '../../../../ApiHelpers/GitHubService';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import DeploymentCenterGitHubDisconnect from './DeploymentCenterGitHubDisconnect';
import { SiteStateContext } from '../../../../SiteState';
import { authorizeWithProvider, getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { ScmType } from '../../../../models/site/config';
import { PortalContext } from '../../../../PortalContext';

const DeploymentCenterGitHubConfiguredView: React.FC<
  DeploymentCenterFieldProps<DeploymentCenterCodeFormData | DeploymentCenterContainerFormData>
> = props => {
  const { t } = useTranslation();
  const { formProps } = props;
  const [org, setOrg] = useState<string | undefined>(undefined);
  const [repo, setRepo] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [repoUrl, setRepoUrl] = useState<string | undefined>(undefined);
  const [gitHubUsername, setGitHubUsername] = useState<string>(t('loading'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGitHubUsernameMissing, setIsGitHubUsernameMissing] = useState(false);
  const [isBranchInfoMissing, setIsBranchInfoMissing] = useState(false);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);

  const deploymentCenterData = new DeploymentCenterData();
  const isGitHubActionsSetup =
    deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.GitHubAction;

  const fetchData = async () => {
    setIsLoading(true);
    setIsGitHubUsernameMissing(false);
    setIsBranchInfoMissing(false);

    const getGitHubUserRequest = deploymentCenterData.getGitHubUser(deploymentCenterContext.gitHubToken);
    const getSourceControlDetailsResponse = deploymentCenterData.getSourceControlDetails(deploymentCenterContext.resourceId);

    portalContext.log(getTelemetryInfo('info', 'initialDataGitHubConfigured', 'submit'));

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
      setIsBranchInfoMissing(true);
      setRepoUrl(t('deploymentCenterErrorFetchingInfo'));
      setOrg(t('deploymentCenterErrorFetchingInfo'));
      setRepo(t('deploymentCenterErrorFetchingInfo'));

      portalContext.log(
        getTelemetryInfo('error', 'sourceControlDetailsResponse', 'failed', {
          message: getErrorMessage(sourceControlDetailsResponse.metadata.error),
          errorAsString: JSON.stringify(sourceControlDetailsResponse.metadata.error),
        })
      );
    }

    if (gitHubUserResponse.metadata.success && gitHubUserResponse.data.login) {
      setGitHubUsername(gitHubUserResponse.data.login);
    } else {
      // NOTE(michinoy): if unsuccessful, assume the user needs to authorize.
      setGitHubUsername('');
      setIsGitHubUsernameMissing(true);

      portalContext.log(
        getTelemetryInfo('error', 'gitHubUserResponse', 'failed', {
          message: getErrorMessage(gitHubUserResponse.metadata.error),
          errorAsString: JSON.stringify(gitHubUserResponse.metadata.error),
        })
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
            portalContext.log(
              getTelemetryInfo('error', 'getGitHubTokenResponse', 'failed', {
                errorAsString: JSON.stringify(response.metadata.error),
              })
            );

            return Promise.resolve(null);
          }
        })
        .then(() => fetchData());
    } else {
      return fetchData();
    }
  };

  const getUsernameMissingComponent = () => {
    return (
      <div className={deploymentCenterInfoBannerDiv}>
        <CustomBanner
          message={
            <>
              {`${t('deploymentCenterSettingsConfiguredViewUserNotAuthorized')} `}
              <Link onClick={authorizeGitHubAccount} target="_blank">
                {t('authorize')}
              </Link>
            </>
          }
          type={MessageBarType.error}
        />
      </div>
    );
  };

  const getBranchLink = () => {
    if (!isBranchInfoMissing) {
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

  const getSignedInAsComponent = (isLoading: boolean) => {
    if (isLoading && formProps && formProps.values.gitHubUser && formProps.values.gitHubUser.login) {
      return formProps.values.gitHubUser.login;
    } else if (isLoading && (!formProps || !formProps.values.gitHubUser || !formProps.values.gitHubUser.login)) {
      return t('loading');
    }
    return gitHubUsername;
  };

  const getOrgValue = (isLoading: boolean) => {
    if (isLoading && formProps && formProps.values.org) {
      return formProps.values.org;
    } else if (isLoading && (!formProps || !formProps.values.repo)) {
      return t('loading');
    }
    return org;
  };

  const getRepoValue = (isLoading: boolean) => {
    if (isLoading && formProps && formProps.values.repo) {
      return formProps.values.repo;
    } else if (isLoading && (!formProps || !formProps.values.repo)) {
      return t('loading');
    }
    return repo;
  };

  const getBranchValue = (isLoading: boolean) => {
    if (isLoading && formProps && formProps.values.branch) {
      return formProps.values.branch;
    } else if (isLoading && (!formProps || !formProps.values.branch)) {
      return t('loading');
    }
    return branch;
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setOrg(getOrgValue(isLoading));
    setRepo(getRepoValue(isLoading));
    setBranch(getBranchValue(isLoading));
    setGitHubUsername(getSignedInAsComponent(isLoading));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <>
      {isGitHubActionsSetup && (
        <ReactiveFormControl id="deployment-center-github-user" label={t('deploymentCenterSettingsSourceLabel')}>
          <div>
            {`${t('deploymentCenterCodeSettingsSourceGitHub')}`}
            {!isLoading && branch && org && repo && repoUrl && (
              <DeploymentCenterGitHubDisconnect formProps={formProps} branch={branch} org={org} repo={repo} repoUrl={repoUrl} />
            )}
          </div>
        </ReactiveFormControl>
      )}
      {siteStateContext.isContainerApp ? (
        <h3>{t('deploymentCenterContainerGitHubActionsTitle')}</h3>
      ) : (
        <h3>{t('deploymentCenterCodeGitHubTitle')}</h3>
      )}
      <ReactiveFormControl id="deployment-center-github-user" label={t('deploymentCenterOAuthSingedInAs')}>
        <>
          {isGitHubUsernameMissing && getUsernameMissingComponent()}
          {!isGitHubUsernameMissing && getSignedInAsComponent(isLoading)}
        </>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-organization" label={t('deploymentCenterOAuthOrganization')}>
        <div>{org}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-repository" label={t('deploymentCenterOAuthRepository')}>
        <div>{repo}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-github-branch" label={t('deploymentCenterOAuthBranch')}>
        <div>{isLoading ? branch : getBranchLink()}</div>
      </ReactiveFormControl>
    </>
  );
};

export default DeploymentCenterGitHubConfiguredView;
