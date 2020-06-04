import React, { useState, useEffect } from 'react';
import DeploymentCenterGitHubProvider from './DeploymentCenterGitHubProvider';
import { GitHubUser } from '../../../../models/github';
import { useTranslation } from 'react-i18next';
import DeploymentCenterData from '../DeploymentCenter.data';
import GitHubService from '../../../../ApiHelpers/GitHubService';
import { DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import { IDropdownOption } from 'office-ui-fabric-react';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';

interface authorizationResult {
  timerId: NodeJS.Timeout;
  redirectUrl?: string;
}

const DeploymentCenterGitHubDataLoader: React.FC<DeploymentCenterFieldProps> = props => {
  const { t } = useTranslation();
  const { formProps } = props;

  const deploymentCenterData = new DeploymentCenterData();
  const [gitHubUser, setGitHubUser] = useState<GitHubUser | undefined>(undefined);
  const [gitHubAccountStatusMessage, setGitHubAccountStatusMessage] = useState<string | undefined>(
    t('deploymentCenterOAuthFetchingUserInformation')
  );

  const [organizationOptions, setOrganizationOptions] = useState<IDropdownOption[]>([]);
  const [repositoryOptions, setRepositoryOptions] = useState<IDropdownOption[]>([]);
  const [branchOptions, setBranchOptions] = useState<IDropdownOption[]>([]);

  const getArmToken = () => {
    return window.appsvc && window.appsvc.env.armToken ? `bearer ${window.appsvc.env.armToken}` : '';
  };

  const fetchOrganizationOptions = async () => {
    setOrganizationOptions([]);
    setRepositoryOptions([]);
    setBranchOptions([]);
    const newOrganizationOptions: IDropdownOption[] = [];

    const armToken = getArmToken();
    if (gitHubUser) {
      const gitHubOrganizationsResponse = await deploymentCenterData.getGitHubOrganizations(armToken);

      if (gitHubOrganizationsResponse.metadata.success) {
        gitHubOrganizationsResponse.data.forEach(org => {
          newOrganizationOptions.push({ key: org.url, text: org.login });
        });
      } else {
        LogService.error(
          LogCategories.deploymentCenter,
          'DeploymentCenterGitHubDataLoader',
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
    const newRepositoryOptions: IDropdownOption[] = [];

    const armToken = getArmToken();

    const gitHubRepositoriesResponse = await (repositories_url.toLocaleLowerCase().indexOf('github.com/users/') > -1
      ? deploymentCenterData.getGitHubUserRepositories(armToken)
      : deploymentCenterData.getGitHubOrgRepositories(repositories_url, armToken));

    if (gitHubRepositoriesResponse.metadata.success) {
      gitHubRepositoriesResponse.data.forEach(repository => {
        newRepositoryOptions.push({ key: repository.url, text: repository.name });
      });
    } else {
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterGitHubDataLoader',
        `Failed to fetch GitHub repositories with error: ${getErrorMessage(gitHubRepositoriesResponse.metadata.error)}`
      );
    }

    setRepositoryOptions(newRepositoryOptions);
  };

  const fetchBranchOptions = async (repository_url: string) => {
    setBranchOptions([]);
    const newBranchOptions: IDropdownOption[] = [];

    const armToken = getArmToken();

    const gitHubBranchesResponse = await deploymentCenterData.getGitHubBranches(repository_url, armToken);

    if (gitHubBranchesResponse.metadata.success) {
      gitHubBranchesResponse.data.forEach(branch => {
        newBranchOptions.push({ key: branch.name, text: branch.name });
      });
    } else {
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterGitHubDataLoader',
        `Failed to fetch GitHub branches with error: ${getErrorMessage(gitHubBranchesResponse.metadata.error)}`
      );
    }

    setBranchOptions(newBranchOptions);
  };

  const authorizeGitHubAccount = async () => {
    const oauthWindow = window.open(GitHubService.authorizeUrl, 'appservice-deploymentcenter-provider-auth', 'width=800, height=600');

    const authPromise = new Promise<authorizationResult>(resolve => {
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
        const armToken = getArmToken();
        return deploymentCenterData.storeGitHubToken(authorizationResult.redirectUrl, armToken).then(() => fetchData());
      } else {
        return fetchData();
      }
    });
  };

  // TODO(michinoy): We will need to add methods here to manage github specific network calls such as:
  // repos, orgs, branches, workflow file, etc.

  const fetchData = async () => {
    const armToken = getArmToken();
    const getGitHubUserRequest = deploymentCenterData.getGitHubUser(armToken);

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
      fetchOrganizationOptions={fetchOrganizationOptions}
      fetchRepositoryOptions={fetchRepositoryOptions}
      fetchBranchOptions={fetchBranchOptions}
      organizationOptions={organizationOptions}
      repositoryOptions={repositoryOptions}
      branchOptions={branchOptions}
    />
  );
};

export default DeploymentCenterGitHubDataLoader;
