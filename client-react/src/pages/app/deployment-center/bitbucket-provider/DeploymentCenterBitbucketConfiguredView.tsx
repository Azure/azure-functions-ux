import React, { useContext, useEffect, useState } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { LogCategories } from '../../../../utils/LogCategories';
import LogService from '../../../../utils/LogService';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { useTranslation } from 'react-i18next';
import { additionalTextFieldControl, deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import { Link, Icon, MessageBarType } from 'office-ui-fabric-react';
import BitbucketService from '../../../../ApiHelpers/BitbucketService';
import { AuthorizationResult } from '../DeploymentCenter.types';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { authorizeWithProvider } from '../utility/DeploymentCenterUtility';

const DeploymentCenterBitbucketConfiguredView: React.FC<{}> = props => {
  const { t } = useTranslation();
  const [repoUrl, setRepoUrl] = useState<string | undefined>(undefined);
  const [org, setOrg] = useState<string | undefined>(undefined);
  const [repo, setRepo] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [bitbucketUsername, setBitbucketUsername] = useState<string | undefined>(t('loading'));
  const [isSourceControlLoading, setIsSourceControlLoading] = useState(true);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterData = new DeploymentCenterData();

  const getSourceControlDetails = async () => {
    getBitbucketUserResponse();
    getSourceControlDetailsResponse();
  };

  const getBitbucketUserResponse = async () => {
    const bitbucketUserResponse = await deploymentCenterData.getBitbucketUser(deploymentCenterContext.bitbucketToken);
    if (bitbucketUserResponse.metadata.success && bitbucketUserResponse.data.username) {
      setBitbucketUsername(bitbucketUserResponse.data.username);
    } else {
      // NOTE(stpelleg): if unsuccessful, assume the user needs to authorize.
      setBitbucketUsername(undefined);

      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterBitbucketConfiguredView',
        `Failed to get Bitbucket user details with error: ${getErrorMessage(bitbucketUserResponse.metadata.error)}`
      );
    }
  };

  const getSourceControlDetailsResponse = async () => {
    const sourceControlDetailsResponse = await deploymentCenterData.getSourceControlDetails(deploymentCenterContext.resourceId);
    if (sourceControlDetailsResponse.metadata.success) {
      setRepoUrl(sourceControlDetailsResponse.data.properties.repoUrl);
      setBranch(sourceControlDetailsResponse.data.properties.branch);

      const repoUrlSplit = sourceControlDetailsResponse.data.properties.repoUrl.split('/');
      if (repoUrlSplit.length >= 2) {
        setOrg(repoUrlSplit[repoUrlSplit.length - 2]);
        setRepo(repoUrlSplit[repoUrlSplit.length - 1]);
      } else {
        setOrg('');
        setRepo('');
        LogService.error(
          LogCategories.deploymentCenter,
          'DeploymentCenterBitbucketConfiguredView',
          `Repository url incorrectly formatted: ${sourceControlDetailsResponse.data.properties.repoUrl}`
        );
      }
    } else {
      setOrg(t('deploymentCenterErrorFetchingInfo'));
      setRepo(t('deploymentCenterErrorFetchingInfo'));
      setBranch(t('deploymentCenterErrorFetchingInfo'));
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterSourceControls',
        `Failed to get source control details with error: ${getErrorMessage(sourceControlDetailsResponse.metadata.error)}`
      );
    }
    setIsSourceControlLoading(false);
  };

  const getSignedInAsComponent = () => {
    if (!bitbucketUsername) {
      return (
        <div className={deploymentCenterInfoBannerDiv}>
          <CustomBanner
            message={
              <>
                {`${t('deploymentCenterSettingsConfiguredViewBitbucketNotAuthorized')} `}
                <Link onClick={authorizeBitbucketAccount} target="_blank">
                  {t('authorize')}
                </Link>
              </>
            }
            type={MessageBarType.error}
          />
        </div>
      );
    }
    return <div>{`${bitbucketUsername}`}</div>;
  };

  const getBranchLink = () => {
    if (branch && repoUrl) {
      return (
        <Link
          key="deployment-center-branch-link"
          onClick={() => window.open(repoUrl, '_blank')}
          className={additionalTextFieldControl}
          aria-label={`${branch}`}>
          {`${branch} `}
          <Icon id={`branch-button`} iconName={'NavigateExternalInline'} />
        </Link>
      );
    }

    return <div>{`${branch}`}</div>;
  };

  const authorizeBitbucketAccount = () => {
    authorizeWithProvider(BitbucketService.authorizeUrl, () => {}, authCallback);
  };

  const authCallback = (authorizationResult: AuthorizationResult) => {
    if (authorizationResult.redirectUrl) {
      return deploymentCenterData
        .getBitbucketToken(authorizationResult.redirectUrl)
        .then(response => {
          if (response.metadata.success) {
            return deploymentCenterData.storeBitbucketToken(response.data);
          } else {
            // NOTE(michinoy): This is all related to the handshake between us and the provider.
            // If this fails, there isn't much the user can do except retry.

            LogService.error(
              LogCategories.deploymentCenter,
              'authorizeBitbucketAccount',
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

  useEffect(() => {
    getSourceControlDetails();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSourceControlLoading) {
      getSourceControlDetailsResponse();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSourceControlLoading]);

  return (
    <>
      <h3>{t('deploymentCenterCodeBitbucketTitle')}</h3>

      <ReactiveFormControl id="deployment-center-bitbucket-user" label={t('deploymentCenterOAuthSingedInAs')}>
        <div>{getSignedInAsComponent()}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-organization" label={t('deploymentCenterOAuthOrganization')}>
        <div>{isSourceControlLoading ? t('loading') : org}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-repository" label={t('deploymentCenterOAuthRepository')}>
        <div>{isSourceControlLoading ? t('loading') : repo}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-bitbucket-branch" label={t('deploymentCenterOAuthBranch')}>
        <div>{isSourceControlLoading ? t('loading') : getBranchLink()}</div>
      </ReactiveFormControl>
    </>
  );
};

export default DeploymentCenterBitbucketConfiguredView;
