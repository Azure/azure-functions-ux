import React, { useState, useEffect, useContext, useRef } from 'react';
import { BitbucketUser } from '../../../../models/bitbucket';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterFieldProps, AuthorizationResult } from '../DeploymentCenter.types';
import { IDropdownOption } from 'office-ui-fabric-react';
import DeploymentCenterBitbucketProvider from './DeploymentCenterBitbucketProvider';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import BitbucketService from '../../../../ApiHelpers/BitbucketService';
import { authorizeWithProvider, getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import { LogLevels } from '../../../../models/telemetry';

const DeploymentCenterBitbucketDataLoader: React.FC<DeploymentCenterFieldProps> = props => {
  const { t } = useTranslation();
  const { formProps } = props;

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);

  const [bitbucketUser, setBitbucketUser] = useState<BitbucketUser | undefined>(undefined);
  const [bitbucketAccountStatusMessage, setBitbucketAccountStatusMessage] = useState<string | undefined>(
    t('deploymentCenterOAuthFetchingUserInformation')
  );

  const [organizationOptions, setOrganizationOptions] = useState<IDropdownOption[]>([]);
  const [repositoryOptions, setRepositoryOptions] = useState<IDropdownOption[]>([]);
  const [branchOptions, setBranchOptions] = useState<IDropdownOption[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [loadingRepositories, setLoadingRepositories] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const orgToReposMapping = useRef<{ [key: string]: IDropdownOption[] }>({});

  const fetchData = async () => {
    portalContext.log(getTelemetryInfo(LogLevels.info, 'getBitbucketUser', 'submit'));
    const bitbucketUserResponse = await deploymentCenterData.getBitbucketUser(deploymentCenterContext.bitbucketToken);

    setBitbucketAccountStatusMessage(undefined);

    if (bitbucketUserResponse.metadata.success && bitbucketUserResponse.data.username) {
      // NOTE(stpelleg): if unsuccessful, assume the user needs to authorize.
      setBitbucketUser(bitbucketUserResponse.data);
      formProps.setFieldValue('bitbucketUser', bitbucketUserResponse.data);
    }
  };

  const fetchOrgAndRepoOptions = async () => {
    setLoadingOrganizations(true);
    orgToReposMapping.current = {};
    setOrganizationOptions([]);
    setRepositoryOptions([]);
    setBranchOptions([]);

    if (bitbucketUser) {
      portalContext.log(getTelemetryInfo(LogLevels.info, 'getBitbucketRepositories', 'submit'));
      const bitbucketRepositoriesResponse = await deploymentCenterData.getBitbucketRepositories(deploymentCenterContext.bitbucketToken);

      bitbucketRepositoriesResponse.forEach(repository => {
        const repoNameParts = repository.full_name.split('/');
        const [org, repo] = repoNameParts;

        if (orgToReposMapping.current[org]) {
          orgToReposMapping.current[org].push({ key: repo, text: repo });
        } else {
          orgToReposMapping.current[org] = [{ key: repo, text: repo }];
        }
      });
    }

    const newOrgOptions: IDropdownOption[] = Object.keys(orgToReposMapping.current).map(org => ({ key: org, text: org }));
    setOrganizationOptions(newOrgOptions);
    setLoadingOrganizations(false);

    // If the form props already contains selected data, set the default to that value.
    if (formProps.values.org && orgToReposMapping.current[formProps.values.org]) {
      fetchRepositoriesInOrganization(formProps.values.org);
    }
  };

  const fetchRepositoriesInOrganization = (org: string) => {
    setLoadingRepositories(true);
    setRepositoryOptions(orgToReposMapping.current[org]);
    setLoadingRepositories(false);
    setBranchOptions([]);

    // If the form props already contains selected data, set the default to that value.
    if (formProps.values.org && formProps.values.repo) {
      fetchBranchOptions(formProps.values.org, formProps.values.repo);
    }
  };

  const fetchBranchOptions = async (org: string, repo: string) => {
    setLoadingBranches(true);
    setBranchOptions([]);

    if (bitbucketUser && organizationOptions && repositoryOptions) {
      const logger = (page, response) => {
        portalContext.log(
          getTelemetryInfo(LogLevels.error, 'getBitbucketBranchesResponse', 'failed', {
            page: page,
            errorAsString: response && response.metadata && response.metadata.error && JSON.stringify(response.metadata.error),
          })
        );
      };

      portalContext.log(getTelemetryInfo(LogLevels.info, 'getBitbucketBranches', 'submit'));
      const bitbucketBranchesResponse = await deploymentCenterData.getBitbucketBranches(
        org,
        repo,
        deploymentCenterContext.bitbucketToken,
        logger
      );
      const newBranchOptions: IDropdownOption[] = bitbucketBranchesResponse.map(branch => ({ key: branch.name, text: branch.name }));
      setBranchOptions(newBranchOptions);
    }

    setLoadingBranches(false);
  };

  const authorizeBitbucketAccount = () => {
    portalContext.log(getTelemetryInfo(LogLevels.info, 'bitBucketAccount', 'authorize'));
    authorizeWithProvider(BitbucketService.authorizeUrl, startingAuthCallback, completingAuthCallBack);
  };

  const completingAuthCallBack = (authorizationResult: AuthorizationResult) => {
    if (authorizationResult.redirectUrl) {
      deploymentCenterData
        .getBitbucketToken(authorizationResult.redirectUrl)
        .then(response => {
          if (response.metadata.success) {
            deploymentCenterData.storeBitbucketToken(response.data);
          } else {
            portalContext.log(
              getTelemetryInfo(LogLevels.error, 'getBitBucketTokenResponse', 'failed', {
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
    setBitbucketAccountStatusMessage(t('deploymentCenterOAuthAuthorizingUser'));
  };

  useEffect(() => {
    if (!formProps.values.bitbucketUser) {
      fetchData();
    } else {
      setBitbucketUser(formProps.values.bitbucketUser);
      setBitbucketAccountStatusMessage(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.bitbucketToken]);

  useEffect(() => {
    fetchOrgAndRepoOptions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bitbucketUser]);

  useEffect(() => {
    if (formProps.values.org && orgToReposMapping.current[formProps.values.org]) {
      fetchRepositoriesInOrganization(formProps.values.org);
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
    <DeploymentCenterBitbucketProvider
      formProps={formProps}
      accountUser={bitbucketUser}
      accountStatusMessage={bitbucketAccountStatusMessage}
      authorizeAccount={authorizeBitbucketAccount}
      organizationOptions={organizationOptions}
      repositoryOptions={repositoryOptions}
      branchOptions={branchOptions}
      loadingOrganizations={loadingOrganizations}
      loadingRepositories={loadingRepositories}
      loadingBranches={loadingBranches}
    />
  );
};

export default DeploymentCenterBitbucketDataLoader;
