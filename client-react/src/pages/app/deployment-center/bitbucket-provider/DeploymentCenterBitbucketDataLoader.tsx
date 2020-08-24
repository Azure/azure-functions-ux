import React, { useState, useEffect, useContext, useRef } from 'react';
import { BitbucketUser } from '../../../../models/bitbucket';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterFieldProps, AuthorizationResult } from '../DeploymentCenter.types';
import { IDropdownOption } from 'office-ui-fabric-react';
import DeploymentCenterBitbucketProvider from './DeploymentCenterBitbucketProvider';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import BitbucketService from '../../../../ApiHelpers/BitbucketService';
import { authorizeWithProvider } from '../utility/DeploymentCenterUtility';

const DeploymentCenterBitbucketDataLoader: React.FC<DeploymentCenterFieldProps> = props => {
  const { t } = useTranslation();
  const { formProps } = props;

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const [bitbucketUser, setBitbucketUser] = useState<BitbucketUser | undefined>(undefined);
  const [bitbucketAccountStatusMessage, setBitbucketAccountStatusMessage] = useState<string | undefined>(
    t('deploymentCenterOAuthFetchingUserInformation')
  );

  const [organizationOptions, setOrganizationOptions] = useState<IDropdownOption[]>([]);
  const [repositoryOptions, setRepositoryOptions] = useState<IDropdownOption[]>([]);
  const [branchOptions, setBranchOptions] = useState<IDropdownOption[]>([]);

  const orgToReposMapping = useRef<{ [key: string]: IDropdownOption[] }>({});

  const fetchData = async () => {
    if (deploymentCenterContext.bitbucketToken) {
      setBitbucketUser(undefined);

      const bitbucketUserResponse = await deploymentCenterData.getBitbucketUser(deploymentCenterContext.bitbucketToken);

      if (bitbucketUserResponse.metadata.success && bitbucketUserResponse.data.username) {
        // NOTE(stpelleg): if unsuccessful, assume the user needs to authorize.
        setBitbucketUser(bitbucketUserResponse.data);
      }
    }
    setBitbucketAccountStatusMessage(undefined);
  };

  const fetchRepositoryOptions = async () => {
    const newOrgToReposMapping = {};
    setOrganizationOptions([]);
    setRepositoryOptions([]);
    setBranchOptions([]);

    if (bitbucketUser) {
      const bitbucketRepositoriesResponse = await deploymentCenterData.getBitbucketRepositories(deploymentCenterContext.bitbucketToken);
      bitbucketRepositoriesResponse.forEach(repository => {
        const repoNameParts = repository.full_name.split('/');
        const [org, repo] = repoNameParts;

        if (newOrgToReposMapping[org]) {
          newOrgToReposMapping[org].push({ key: repo, text: repo });
        } else {
          newOrgToReposMapping[org] = [{ key: repo, text: repo }];
        }
      });
    }

    orgToReposMapping.current = newOrgToReposMapping;
    const newOrgOptions: IDropdownOption[] = Object.keys(orgToReposMapping.current).map(org => ({ key: org, text: org }));
    setOrganizationOptions(newOrgOptions);
  };

  const fetchRepositoriesInOrganization = (org: string) => {
    setRepositoryOptions(orgToReposMapping.current[org]);
    setBranchOptions([]);
  };

  const fetchBranchOptions = async (org: string, repo: string) => {
    setBranchOptions([]);

    if (bitbucketUser && organizationOptions && repositoryOptions) {
      const logger = (page, response) => {
        LogService.error(
          LogCategories.deploymentCenter,
          'BitbucketGetBranches',
          `Failed to fetch Bitbucket branches with error: ${getErrorMessage(response.metadata.error)}`
        );
      };

      const bitbucketBranchesResponse = await deploymentCenterData.getBitbucketBranches(
        org,
        repo,
        deploymentCenterContext.bitbucketToken,
        logger
      );
      const newBranchOptions: IDropdownOption[] = bitbucketBranchesResponse.map(branch => ({ key: branch.name, text: branch.name }));
      setBranchOptions(newBranchOptions);
    }
  };

  const authorizeBitbucketAccount = () => {
    authorizeWithProvider(BitbucketService.authorizeUrl, startingAuthCallback, completingAuthCallBack);
  };

  const completingAuthCallBack = (authorizationResult: AuthorizationResult) => {
    if (authorizationResult.redirectUrl) {
      deploymentCenterData
        .getBitbucketToken(authorizationResult.redirectUrl)
        .then(response => deploymentCenterData.storeBitbucketToken(response.data))
        .then(() => deploymentCenterContext.refreshUserSourceControlTokens());
    } else {
      return fetchData();
    }
  };

  const startingAuthCallback = (): void => {
    setBitbucketAccountStatusMessage(t('deploymentCenterOAuthAuthorizingUser'));
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.bitbucketToken]);

  useEffect(() => {
    fetchRepositoryOptions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bitbucketUser]);

  return (
    <DeploymentCenterBitbucketProvider
      formProps={formProps}
      accountUser={bitbucketUser}
      accountStatusMessage={bitbucketAccountStatusMessage}
      authorizeAccount={authorizeBitbucketAccount}
      fetchRepositoriesInOrganization={fetchRepositoriesInOrganization}
      fetchBranchOptions={fetchBranchOptions}
      organizationOptions={organizationOptions}
      repositoryOptions={repositoryOptions}
      branchOptions={branchOptions}
    />
  );
};

export default DeploymentCenterBitbucketDataLoader;
