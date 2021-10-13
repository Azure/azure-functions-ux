import React, { useState, useEffect, useContext, useRef } from 'react';
import DeploymentCenterGitHubProvider from './DeploymentCenterGitHubProvider';
import { GitHubUser } from '../../../../models/github';
import { useTranslation } from 'react-i18next';
import DeploymentCenterData from '../DeploymentCenter.data';
import GitHubService from '../../../../ApiHelpers/GitHubService';
import { DeploymentCenterFieldProps, AuthorizationResult, SearchTermObserverInfo } from '../DeploymentCenter.types';
import { IDropdownOption } from 'office-ui-fabric-react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { authorizeWithProvider, getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import { KeyValue } from '../../../../models/portal-models';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

const searchTermObserver = new Subject<SearchTermObserverInfo>();
searchTermObserver
  .pipe(debounceTime(500))
  .pipe(
    switchMap(async info => {
      const searchTerm = info.searchTerm;
      const setRepositoryOptions = info.setRepositoryOptions;
      const setLoadingRepositories = info.setLoadingRepositories;
      const fetchBranchOptions = info.fetchBranchOptions;
      const deploymentCenterContext = info.deploymentCenterContext;
      const deploymentCenterData = info.deploymentCenterData;
      const portalContext = info.portalContext;
      const repositoriesUrl = info.repositoryUrl;
      const isGitHubActions = info.isGitHubActions;
      const org = info.org;
      const repo = info.repo;

      let gitHubRepositories;

      if (repositoriesUrl.toLocaleLowerCase().indexOf('github.com/users/') > -1) {
        gitHubRepositories = await deploymentCenterData.getGitHubUserRepositories(
          deploymentCenterContext.gitHubToken,
          (page, response) => {
            portalContext.log(
              getTelemetryInfo('error', 'getGitHubUserRepositoriesResponse', 'failed', {
                page,
                errorAsString: response && response.metadata && response.metadata.error && JSON.stringify(response.metadata.error),
              })
            );
          },
          searchTerm
        );
      } else {
        gitHubRepositories = await deploymentCenterData.getGitHubOrgRepositories(
          org,
          deploymentCenterContext.gitHubToken,
          (page, response) => {
            portalContext.log(
              getTelemetryInfo('error', 'getGitHubOrgRepositoriesResponse', 'failed', {
                page,
                errorAsString: response && response.metadata && response.metadata.error && JSON.stringify(response.metadata.error),
              })
            );
          },
          searchTerm
        );
      }

      let newRepositoryOptions: IDropdownOption[] = [];
      if (isGitHubActions) {
        newRepositoryOptions = gitHubRepositories.map(repo => ({ key: repo.name, text: repo.name }));
      } else {
        newRepositoryOptions = gitHubRepositories
          .filter(repo => !repo.permissions || repo.permissions.admin)
          .map(repo => ({ key: repo.name, text: repo.name }));
      }

      newRepositoryOptions.sort((a, b) => a.text.localeCompare(b.text));

      setRepositoryOptions(newRepositoryOptions);
      setLoadingRepositories(false);

      // If the form props already contains selected data, set the default to that value.
      if (org && repo && repo == searchTerm) {
        fetchBranchOptions(org, repo);
      }
    })
  )
  .subscribe();

const DeploymentCenterGitHubDataLoader: React.FC<DeploymentCenterFieldProps> = props => {
  const { t } = useTranslation();
  const { formProps, isGitHubActions } = props;

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
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [loadingRepositories, setLoadingRepositories] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [hasDeprecatedToken, setHasDeprecatedToken] = useState(false);
  const [updateTokenSuccess, setUpdateTokenSuccess] = useState(false);
  const [clearComboBox, setClearComboBox] = useState<KeyValue<boolean>>({ repo: true, branch: true });

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
      const gitHubOrganizations = await deploymentCenterData.getGitHubOrganizations(
        deploymentCenterContext.gitHubToken,
        (page, response) => {
          portalContext.log(
            getTelemetryInfo('error', 'getGitHubUserRepositoriesResponse', 'failed', {
              page,
              errorAsString: response && response.metadata && response.metadata.error && JSON.stringify(response.metadata.error),
            })
          );
        }
      );

      gitHubOrganizations.forEach(org => {
        newOrganizationOptions.push({ key: org.login, text: org.login });
        if (!gitHubOrgToUrlMapping.current[org.login]) {
          gitHubOrgToUrlMapping.current[org.login] = org.url;
        }
      });

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

  const fetchRepositoryOptions = async (repositoriesUrl: string, searchTerm?: string) => {
    setRepositoryOptions([]);
    setBranchOptions([]);

    portalContext.log(getTelemetryInfo('info', 'gitHubRepositories', 'submit'));

    const info: SearchTermObserverInfo = {
      searchTerm: searchTerm,
      setRepositoryOptions: setRepositoryOptions,
      setLoadingRepositories: setLoadingRepositories,
      fetchBranchOptions: fetchBranchOptions,
      repositoryUrl: repositoriesUrl,
      deploymentCenterData: deploymentCenterData,
      deploymentCenterContext: deploymentCenterContext,
      portalContext: portalContext,
      isGitHubActions: isGitHubActions,
      org: formProps.values.org,
      repo: formProps.values.repo,
    };

    searchTermObserver.next(info);
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
      deploymentCenterData.getGitHubToken(authorizationResult.redirectUrl).then(response => {
        if (response.metadata.success) {
          deploymentCenterData.storeGitHubToken(response.data).then(() => deploymentCenterContext.refreshUserSourceControlTokens());
        } else {
          portalContext.log(
            getTelemetryInfo('error', 'getGitHubTokenResponse', 'failed', {
              errorAsString: JSON.stringify(response.metadata.error),
            })
          );
          return Promise.resolve(undefined);
        }
      });
    } else {
      return fetchData();
    }
  };

  const startingAuthCallback = (): void => {
    setGitHubAccountStatusMessage(t('deploymentCenterOAuthAuthorizingUser'));
  };

  const resetToken = async () => {
    if (!!gitHubUser && !!deploymentCenterContext.gitHubToken) {
      const response = await deploymentCenterData.resetToken(deploymentCenterContext.gitHubToken);
      if (response.metadata.success) {
        deploymentCenterData.storeGitHubToken(response.data).then(() => {
          deploymentCenterContext.refreshUserSourceControlTokens();
          setHasDeprecatedToken(false);
          setUpdateTokenSuccess(true);
        });
      } else {
        portalContext.log(
          getTelemetryInfo('error', 'resetToken', 'failed', {
            errorAsString: JSON.stringify(response.metadata.error),
          })
        );
      }
    }
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

    if (!!deploymentCenterContext.gitHubToken && !deploymentCenterContext.gitHubToken.startsWith('gho')) {
      portalContext.log(
        getTelemetryInfo('info', 'checkDeprecatedToken', 'submit', {
          resourceId: deploymentCenterContext.resourceId,
        })
      );
      setHasDeprecatedToken(true);
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
    setBranchOptions([]);
    setClearComboBox({ branch: true, repo: true });
    setLoadingRepositories(true);
    setLoadingBranches(true);

    if (formProps.values.org && gitHubOrgToUrlMapping.current[formProps.values.org]) {
      fetchRepositoryOptions(gitHubOrgToUrlMapping.current[formProps.values.org]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.org]);

  useEffect(() => {
    setRepositoryOptions([]);
    setBranchOptions([]);
    setClearComboBox({ branch: true, repo: false });
    setLoadingBranches(true);

    if (
      formProps.values.org &&
      gitHubOrgToUrlMapping.current[formProps.values.org] &&
      formProps.values.org != formProps.values.searchTerm
    ) {
      fetchRepositoryOptions(gitHubOrgToUrlMapping.current[formProps.values.org], formProps.values.searchTerm);
    }
  }, [formProps.values.searchTerm]);

  useEffect(() => {
    setBranchOptions([]);
    setClearComboBox({ branch: true, repo: false });
    setLoadingBranches(true);

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
      hasDeprecatedToken={hasDeprecatedToken}
      updateTokenSuccess={updateTokenSuccess}
      resetToken={resetToken}
      clearComboBox={clearComboBox}
    />
  );
};

export default DeploymentCenterGitHubDataLoader;
