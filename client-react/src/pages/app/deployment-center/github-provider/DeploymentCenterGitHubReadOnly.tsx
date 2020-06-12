import React, { useContext, useEffect, useState } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { LogCategories } from '../../../../utils/LogCategories';
import LogService from '../../../../utils/LogService';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { useTranslation } from 'react-i18next';
import { additionalTextFieldControl, deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import { Link, Icon, MessageBarType, MessageBar } from 'office-ui-fabric-react';
import { DeploymentCenterReadOnlySettingsProps, AuthorizationResult } from '../DeploymentCenter.types';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { messageBannerStyles, messageBannerIconStyle } from '../../../../components/CustomBanner/CustomBanner.styles';
import { ReactComponent as ErrorSvg } from '../../../../images/Common/Error.svg';
import GitHubService from '../../../../ApiHelpers/GitHubService';

const DeploymentCenterGitHubReadOnly: React.FC<DeploymentCenterReadOnlySettingsProps> = props => {
  const { disconnect } = props;
  const { t } = useTranslation();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterData = new DeploymentCenterData();
  const [org, setOrg] = useState<string>(t('loading'));
  const [repo, setRepo] = useState<string>(t('loading'));
  const [branch, setBranch] = useState<string>(t('loading'));
  const [repoUrl, setRepoUrl] = useState<string | undefined>(undefined);
  const [gitHubUsername, setGitHubUsername] = useState<string>(t('loading'));

  const getArmToken = () => {
    return window.appsvc && window.appsvc.env.armToken ? `bearer ${window.appsvc.env.armToken}` : '';
  };

  const fetchData = async () => {
    const getGitHubUserRequest = deploymentCenterData.getGitHubUser(getArmToken());
    const getSourceControlDetailsResponse = deploymentCenterData.getSourceControlDetails(deploymentCenterContext.resourceId);

    const [gitHubUserResponse, sourceControlDetailsResponse] = await Promise.all([getGitHubUserRequest, getSourceControlDetailsResponse]);

    if (sourceControlDetailsResponse.metadata.success) {
      setRepoUrl(sourceControlDetailsResponse.data.properties.repoUrl);
      setBranch(sourceControlDetailsResponse.data.properties.branch);

      const repoUrlSplit = sourceControlDetailsResponse.data.properties.repoUrl.split('/');
      setOrg(repoUrlSplit[repoUrlSplit.length - 2]);
      setRepo(repoUrlSplit[repoUrlSplit.length - 1]);
    } else {
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterSourceControls',
        `Failed to get source control details with error: ${getErrorMessage(sourceControlDetailsResponse.metadata.error)}`
      );
    }

    if (gitHubUserResponse.metadata.success && gitHubUserResponse.data.login) {
      // NOTE(michinoy): if unsuccessful, assume the user needs to authorize.
      setGitHubUsername(gitHubUserResponse.data.login);
    } else {
      setGitHubUsername('');
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const authorizeGitHubAccount = async () => {
    // TODO(t-kakan): this is almost duplicate function to what is used in DeploymentCenterGitHubDataLoader. Look into refactoring
    const oauthWindow = window.open(GitHubService.authorizeUrl, 'appservice-deploymentcenter-provider-auth', 'width=800, height=600');

    const authPromise = new Promise<AuthorizationResult>(resolve => {
      // Check for authorization status every 100 ms.
      const timerId = setInterval(() => {
        if (oauthWindow && oauthWindow.document.URL.indexOf(`/callback`) !== -1) {
          resolve({
            timerId,
            redirectUrl: oauthWindow.document.URL,
          });
        } else if (oauthWindow && oauthWindow.closed) {
          resolve({
            timerId,
          });
        }
      }, 100);

      // If no activity after 60 seconds, turn off the timer and close the auth window.
      setTimeout(() => {
        resolve({
          timerId,
        });
      }, 60000);
    });

    return authPromise.then(authorizationResult => {
      clearInterval(authorizationResult.timerId);
      oauthWindow && oauthWindow.close();

      if (authorizationResult.redirectUrl) {
        return deploymentCenterData.storeGitHubToken(authorizationResult.redirectUrl, getArmToken()).then(() => fetchData());
      } else {
        return fetchData();
      }
    });
  };

  return (
    <>
      <p>
        <span id="deployment-center-settings-message">{t('deploymentCenterCodeSettingsDescription')}</span>
        <Link
          id="deployment-center-settings-learnMore"
          href={DeploymentCenterLinks.appServiceDocumentation}
          target="_blank"
          className={learnMoreLinkStyle}
          aria-labelledby="deployment-center-settings-message">
          {` ${t('learnMore')}`}
        </Link>
      </p>

      <ReactiveFormControl id="deployment-center-github-user" label={t('deploymentCenterSettingsSourceLabel')}>
        <div>
          {`${t('deploymentCenterCodeSettingsSourceGitHub')}`}
          <Link
            key="deployment-center-disconnect-link"
            onClick={disconnect}
            className={additionalTextFieldControl}
            aria-label={t('disconnect')}>
            <Icon
              iconName={'PlugDisconnected'}
              styles={{
                root: {
                  height: '100%',
                },
              }}
            />
            {` ${t('disconnect')}`}
          </Link>
        </div>
      </ReactiveFormControl>
      {deploymentCenterContext.isContainerApplication ? (
        <h3>{t('deploymentCenterContainerGitHubActionsTitle')}</h3>
      ) : (
        <h3>{t('deploymentCenterCodeGitHubTitle')}</h3>
      )}
      {gitHubUsername ? (
        <ReactiveFormControl id="deployment-center-github-user" label={t('deploymentCenterOAuthSingedInAs')}>
          <div>{`${gitHubUsername}`}</div>
        </ReactiveFormControl>
      ) : (
        <div className={deploymentCenterInfoBannerDiv}>
          <MessageBar
            id={`$github-not-authorized-custom-banner`}
            isMultiline={true}
            messageBarType={MessageBarType.error}
            styles={messageBannerStyles(true)}>
            <span className={messageBannerIconStyle}>
              <ErrorSvg />
            </span>
            <span>
              {`${t('deploymentCenterSettingsReadOnlyGitHubNotAuthorized')} `}
              <Link onClick={authorizeGitHubAccount} target="_blank">
                {t('authorize')}
              </Link>
            </span>
          </MessageBar>
        </div>
      )}
      <ReactiveFormControl id="deployment-center-organization" label={t('deploymentCenterOAuthOrganization')}>
        <div>{`${org}`}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-repository" label={t('deploymentCenterOAuthRepository')}>
        <div>{`${repo}`}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-github-branch" label={t('deploymentCenterOAuthBranch')}>
        <div>
          {repoUrl ? (
            <Link
              key="deployment-center-branch-link"
              onClick={() => window.open(repoUrl, '_blank')}
              className={additionalTextFieldControl}
              aria-label={`${branch}`}>
              {`${branch} `}
              <Icon
                id={`branch-button`}
                iconName={'NavigateExternalInline'}
                styles={{
                  root: {
                    height: '100%',
                  },
                }}
              />
            </Link>
          ) : (
            `${branch}`
          )}
        </div>
      </ReactiveFormControl>
    </>
  );
};

export default DeploymentCenterGitHubReadOnly;
