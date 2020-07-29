import React, { useState, useEffect, useContext } from 'react';
import DeploymentCenterGitHubProvider from './DeploymentCenterGitHubProvider';
import { GitHubUser } from '../../../../models/github';
import { useTranslation } from 'react-i18next';
import DeploymentCenterData from '../DeploymentCenter.data';
import GitHubService from '../../../../ApiHelpers/GitHubService';
import { DeploymentCenterFieldProps, AuthorizationResult } from '../DeploymentCenter.types';
import { IDropdownOption } from 'office-ui-fabric-react';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { DeploymentCenterContext } from '../DeploymentCenterContext';

const DeploymentCenterGitHubDataLoader: React.FC<DeploymentCenterFieldProps> = props => {
  const { t } = useTranslation();
  const { formProps } = props;

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const [gitHubUser, setGitHubUser] = useState<GitHubUser | undefined>(undefined);
  const [gitHubAccountStatusMessage, setGitHubAccountStatusMessage] = useState<string | undefined>(
    t('deploymentCenterOAuthFetchingUserInformation')
  );

  const [organizationOptions, setOrganizationOptions] = useState<IDropdownOption[]>([]);
  const [repositoryOptions, setRepositoryOptions] = useState<IDropdownOption[]>([]);
  const [branchOptions, setBranchOptions] = useState<IDropdownOption[]>([]);

  const fetchOrganizationOptions = async () => {
    setOrganizationOptions([]);
    setRepositoryOptions([]);
    setBranchOptions([]);
    const newOrganizationOptions: IDropdownOption[] = [];

    if (gitHubUser) {
      const gitHubOrganizationsResponse = await deploymentCenterData.getGitHubOrganizations(deploymentCenterContext.gitHubToken || '');

      if (gitHubOrganizationsResponse.metadata.success) {
        gitHubOrganizationsResponse.data.forEach(org => {
          newOrganizationOptions.push({ key: org.url, text: org.login });
        });
      } else {
        LogService.error(
          LogCategories.deploymentCenter,
          'GitHubGetOrganizations',
          `Failed to fetch GitHub organizations with error: ${getErrorMessage(gitHubOrganizationsResponse.metadata.error)}`
        );
      }

      newOrganizationOptions.push({ key: gitHubUser.repos_url, text: gitHubUser.login });
    }

    setOrganizationOptions(newOrganizationOptions);
  };

  const fetchRepositoryOptions = async (repositories_url: string) => {
    setRepositoryOptions([]);
    setBranchOptions([]);
    const gitHubToken = deploymentCenterContext.gitHubToken || '';

    const gitHubRepositories = await (repositories_url.toLocaleLowerCase().indexOf('github.com/users/') > -1
      ? deploymentCenterData.getGitHubUserRepositories(gitHubToken, (page, response) => {
          LogService.error(
            LogCategories.deploymentCenter,
            'GitHubGetUserRepositories',
            `Failed to fetch GitHub repositories with error: ${getErrorMessage(response.metadata.error)}`
          );
        })
      : deploymentCenterData.getGitHubOrgRepositories(repositories_url, gitHubToken, (page, response) => {
          LogService.error(
            LogCategories.deploymentCenter,
            'GitHubGetOrgRepositories',
            `Failed to fetch GitHub repositories with error: ${getErrorMessage(response.metadata.error)}`
          );
        }));

    const newRepositoryOptions: IDropdownOption[] = gitHubRepositories
      .filter(repo => !repo.permissions || repo.permissions.admin)
      .map(repo => ({ key: repo.name, text: repo.name }));

    setRepositoryOptions(newRepositoryOptions);
  };

  const fetchBranchOptions = async (org: string, repo: string) => {
    setBranchOptions([]);
    const gitHubToken = deploymentCenterContext.gitHubToken || '';

    const gitHubBranches = await deploymentCenterData.getGitHubBranches(org, repo, gitHubToken, (page, response) => {
      LogService.error(
        LogCategories.deploymentCenter,
        'GitHubGetBranches',
        `Failed to fetch GitHub branches with error: ${getErrorMessage(response.metadata.error)}`
      );
    });

    const newBranchOptions: IDropdownOption[] = gitHubBranches.map(branch => ({ key: branch.name, text: branch.name }));

    setBranchOptions(newBranchOptions);
  };

  const authorizeGitHubAccount = async () => {
    const oauthWindow = window.open(GitHubService.authorizeUrl, 'appservice-deploymentcenter-provider-auth', 'width=800, height=600');

    const authPromise = new Promise<AuthorizationResult>(resolve => {
      setGitHubAccountStatusMessage(t('deploymentCenterOAuthAuthorizingUser'));

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
        return deploymentCenterData
          .getGitHubToken(authorizationResult.redirectUrl)
          .then(response => deploymentCenterData.storeGitHubToken(response.data))
          .then(() => fetchData());
      } else {
        return fetchData();
      }
    });
  };

  // TODO(michinoy): We will need to add methods here to manage github specific network calls such as:
  // repos, orgs, branches, workflow file, etc.

  const fetchData = async () => {
    const getGitHubUserRequest = deploymentCenterData.getGitHubUser(deploymentCenterContext.gitHubToken || '');

    const [gitHubUserResponse] = await Promise.all([getGitHubUserRequest]);

    setGitHubAccountStatusMessage(undefined);

    if (gitHubUserResponse.metadata.success && gitHubUserResponse.data.login) {
      // NOTE(michinoy): if unsuccessful, assume the user needs to authorize.
      setGitHubUser(gitHubUserResponse.data);
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchOrganizationOptions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gitHubUser]);

  return (
    <DeploymentCenterGitHubProvider
      formProps={formProps}
      gitHubUser={gitHubUser}
      gitHubAccountStatusMessage={gitHubAccountStatusMessage}
      authorizeGitHubAccount={authorizeGitHubAccount}
      fetchRepositoryOptions={fetchRepositoryOptions}
      fetchBranchOptions={fetchBranchOptions}
      organizationOptions={organizationOptions}
      repositoryOptions={repositoryOptions}
      branchOptions={branchOptions}
    />
  );
};

export default DeploymentCenterGitHubDataLoader;
