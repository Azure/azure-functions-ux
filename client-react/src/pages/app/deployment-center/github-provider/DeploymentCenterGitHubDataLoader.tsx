import React, { useState, useEffect, useContext, useRef } from 'react';
import DeploymentCenterGitHubProvider from './DeploymentCenterGitHubProvider';
import { GitHubUser } from '../../../../models/github';
import { useTranslation } from 'react-i18next';
import DeploymentCenterData from '../DeploymentCenter.data';
import GitHubService from '../../../../ApiHelpers/GitHubService';
import { DeploymentCenterFieldProps, AuthorizationResult } from '../DeploymentCenter.types';
import { IDropdownOption } from 'office-ui-fabric-react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { authorizeWithProvider, getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';

const DeploymentCenterGitHubDataLoader: React.FC<DeploymentCenterFieldProps> = props => {
  const { t } = useTranslation();
  const { formProps } = props;

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);

  const [gitHubUser, setGitHubUser] = useState<GitHubUser | undefined>(undefined);
  const [gitHubAccountStatusMessage, setGitHubAccountStatusMessage] = useState<string | undefined>(
    t('deploymentCenterOAuthFetchingUserInformation')
  );

  const [organizationOptions, setOrganizationOptions] = useState<IDropdownOption[]>([]);
  const [repositoryOptions, setRepositoryOptions] = useState<IDropdownOption[]>([]);
  const [branchOptions, setBranchOptions] = useState<IDropdownOption[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [loadingRepositories, setLoadingRepositories] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const gitHubOrgToUrlMapping = useRef<{ [key: string]: string }>({});

  const fetchOrganizationOptions = async () => {
    setLoadingOrganizations(true);
    gitHubOrgToUrlMapping.current = {};
    setOrganizationOptions([]);
    setRepositoryOptions([]);
    setBranchOptions([]);
    const newOrganizationOptions: IDropdownOption[] = [];

    if (gitHubUser) {
      portalContext.log(getTelemetryInfo('info', 'getGitHubOrganizations', 'submit'));
      const gitHubOrganizationsResponse = await deploymentCenterData.getGitHubOrganizations(deploymentCenterContext.gitHubToken);

      if (gitHubOrganizationsResponse.metadata.success) {
        gitHubOrganizationsResponse.data.forEach(org => {
          newOrganizationOptions.push({ key: org.login, text: org.login });

          if (!gitHubOrgToUrlMapping.current[org.login]) {
            gitHubOrgToUrlMapping.current[org.login] = org.url;
          }
        });
      } else {
        portalContext.log(
          getTelemetryInfo('error', 'getGitHubOrganizationsResponse', 'failed', {
            errorAsString: JSON.stringify(gitHubOrganizationsResponse.metadata.error),
          })
        );
      }

      newOrganizationOptions.push({ key: gitHubUser.login, text: gitHubUser.login });

      if (!gitHubOrgToUrlMapping.current[gitHubUser.login]) {
        gitHubOrgToUrlMapping.current[gitHubUser.login] = gitHubUser.repos_url;
      }
    }

    setOrganizationOptions(newOrganizationOptions);
    setLoadingOrganizations(false);

    // If the form props already contains selected data, set the default to that value.
    if (formProps.values.org && gitHubOrgToUrlMapping.current[formProps.values.org]) {
      fetchRepositoryOptions(gitHubOrgToUrlMapping.current[formProps.values.org]);
    }
  };

  const fetchRepositoryOptions = async (repositories_url: string) => {
    setLoadingRepositories(true);
    setRepositoryOptions([]);
    setBranchOptions([]);

    portalContext.log(getTelemetryInfo('info', 'gitHubRepositories', 'submit'));
    const gitHubRepositories = await (repositories_url.toLocaleLowerCase().indexOf('github.com/users/') > -1
      ? deploymentCenterData.getGitHubUserRepositories(deploymentCenterContext.gitHubToken, (page, response) => {
          portalContext.log(
            getTelemetryInfo('error', 'getGitHubUserRepositoriesResponse', 'failed', {
              page,
              errorAsString: response && response.metadata && response.metadata.error && JSON.stringify(response.metadata.error),
            })
          );
        })
      : deploymentCenterData.getGitHubOrgRepositories(repositories_url, deploymentCenterContext.gitHubToken, (page, response) => {
          portalContext.log(
            getTelemetryInfo('error', 'getGitHubOrgRepositoriesResponse', 'failed', {
              page,
              errorAsString: response && response.metadata && response.metadata.error && JSON.stringify(response.metadata.error),
            })
          );
        }));

    const newRepositoryOptions: IDropdownOption[] = gitHubRepositories
      .filter(repo => !repo.permissions || repo.permissions.admin)
      .map(repo => ({ key: repo.name, text: repo.name }));

    setRepositoryOptions(newRepositoryOptions);
    setLoadingRepositories(false);

    // If the form props already contains selected data, set the default to that value.
    if (formProps.values.org && formProps.values.repo) {
      fetchBranchOptions(formProps.values.org, formProps.values.repo);
    }
  };

  const fetchBranchOptions = async (org: string, repo: string) => {
    setLoadingBranches(true);
    setBranchOptions([]);

    const gitHubBranches = await deploymentCenterData.getGitHubBranches(
      org,
      repo,
      deploymentCenterContext.gitHubToken,
      (page, response) => {
        portalContext.log(
          getTelemetryInfo('error', 'getGitHubBranchesResponse', 'failed', {
            page,
            errorAsString: response && response.metadata && response.metadata.error && JSON.stringify(response.metadata.error),
          })
        );
      }
    );

    const newBranchOptions: IDropdownOption[] = gitHubBranches.map(branch => ({ key: branch.name, text: branch.name }));

    setBranchOptions(newBranchOptions);
    setLoadingBranches(false);
  };

  const authorizeGitHubAccount = () => {
    portalContext.log(getTelemetryInfo('info', 'gitHubAccount', 'authorize'));
    authorizeWithProvider(GitHubService.authorizeUrl, startingAuthCallback, completingAuthCallBack);
  };

  const completingAuthCallBack = (authorizationResult: AuthorizationResult) => {
    if (authorizationResult.redirectUrl) {
      deploymentCenterData
        .getGitHubToken(authorizationResult.redirectUrl)
        .then(response => {
          if (response.metadata.success) {
            deploymentCenterData.storeGitHubToken(response.data);
          } else {
            portalContext.log(
              getTelemetryInfo('error', 'getGitHubTokenResponse', 'failed', {
                errorAsString: JSON.stringify(response.metadata.error),
              })
            );
            return Promise.resolve(undefined);
          }
        })
        .then(() => deploymentCenterContext.refreshUserSourceControlTokens());
    } else {
      return fetchData();
    }
  };

  const startingAuthCallback = (): void => {
    setGitHubAccountStatusMessage(t('deploymentCenterOAuthAuthorizingUser'));
  };

  // TODO(michinoy): We will need to add methods here to manage github specific network calls such as:
  // repos, orgs, branches, workflow file, etc.

  const fetchData = async () => {
    portalContext.log(getTelemetryInfo('info', 'getGitHubUser', 'submit'));
    const gitHubUserResponse = await deploymentCenterData.getGitHubUser(deploymentCenterContext.gitHubToken);

    setGitHubAccountStatusMessage(undefined);

    if (gitHubUserResponse.metadata.success && gitHubUserResponse.data.login) {
      // NOTE(michinoy): if unsuccessful, assume the user needs to authorize.
      setGitHubUser(gitHubUserResponse.data);
      formProps.setFieldValue('gitHubUser', gitHubUserResponse.data);
    }
  };

  useEffect(() => {
    if (!formProps.values.gitHubUser) {
      fetchData();
    } else {
      setGitHubUser(formProps.values.gitHubUser);
      setGitHubAccountStatusMessage(undefined);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.gitHubToken]);

  useEffect(() => {
    fetchOrganizationOptions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gitHubUser]);

  useEffect(() => {
    if (formProps.values.org && gitHubOrgToUrlMapping.current[formProps.values.org]) {
      fetchRepositoryOptions(gitHubOrgToUrlMapping.current[formProps.values.org]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.org]);

  useEffect(() => {
    if (formProps.values.org && formProps.values.repo) {
      fetchBranchOptions(formProps.values.org, formProps.values.repo);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.repo]);

  return (
    <DeploymentCenterGitHubProvider
      formProps={formProps}
      accountUser={gitHubUser}
      accountStatusMessage={gitHubAccountStatusMessage}
      authorizeAccount={authorizeGitHubAccount}
      organizationOptions={organizationOptions}
      repositoryOptions={repositoryOptions}
      branchOptions={branchOptions}
      loadingOrganizations={loadingOrganizations}
      loadingRepositories={loadingRepositories}
      loadingBranches={loadingBranches}
    />
  );
};

export default DeploymentCenterGitHubDataLoader;
