import React, { useContext, useEffect, useState } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { useTranslation } from 'react-i18next';
import { deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import { Link, Icon, MessageBarType } from 'office-ui-fabric-react';
import BitbucketService from '../../../../ApiHelpers/BitbucketService';
import { AuthorizationResult, DeploymentCenterCodeFormData, DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { authorizeWithProvider, getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';

const DeploymentCenterBitbucketConfiguredView: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const [repoUrl, setRepoUrl] = useState<string | undefined>(undefined);
  const [org, setOrg] = useState<string | undefined>(undefined);
  const [repo, setRepo] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [bitbucketUsername, setBitbucketUsername] = useState<string | undefined>(t('loading'));
  const [isSourceControlLoading, setIsSourceControlLoading] = useState(true);
  const [isBitbucketUsernameLoading, setIsBitbucketUsernameLoading] = useState(true);
  const [isBitbucketUsernameMissing, setIsBitbucketUsernameMissing] = useState(false);
  const [isBranchInfoMissing, setIsBranchInfoMissing] = useState(false);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);

  const deploymentCenterData = new DeploymentCenterData();

  const fetchData = async () => {
    fetchBitbucketUser();
    fetchSourceControlDetails();
  };

  const fetchBitbucketUser = async () => {
    setIsBitbucketUsernameMissing(false);
    const bitbucketUserResponse = await deploymentCenterData.getBitbucketUser(deploymentCenterContext.bitbucketToken);
    if (bitbucketUserResponse.metadata.success && bitbucketUserResponse.data.username) {
      setBitbucketUsername(bitbucketUserResponse.data.username);
    } else {
      // NOTE(stpelleg): if unsuccessful, assume the user needs to authorize.
      setBitbucketUsername(undefined);
      setIsBitbucketUsernameMissing(true);

      portalContext.log(
        getTelemetryInfo('error', 'getBitbucketUser', 'failed', {
          message: getErrorMessage(bitbucketUserResponse.metadata.error),
          error: bitbucketUserResponse.metadata.error,
        })
      );
    }
    setIsBitbucketUsernameLoading(false);
  };

  const fetchSourceControlDetails = async () => {
    setIsBranchInfoMissing(false);
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

        portalContext.log(
          getTelemetryInfo('error', 'splitRepositoryUrl', 'failed', {
            message: `Repository url incorrectly formatted: ${sourceControlDetailsResponse.data.properties.repoUrl}`,
          })
        );
      }
    } else {
      setIsBranchInfoMissing(true);
      setOrg(t('deploymentCenterErrorFetchingInfo'));
      setRepo(t('deploymentCenterErrorFetchingInfo'));
      setBranch(t('deploymentCenterErrorFetchingInfo'));

      portalContext.log(
        getTelemetryInfo('error', 'getSourceControls', 'failed', {
          message: getErrorMessage(sourceControlDetailsResponse.metadata.error),
          error: sourceControlDetailsResponse.metadata.error,
        })
      );
    }
    setIsSourceControlLoading(false);
  };

  const authorizeBitbucketAccount = () => {
    authorizeWithProvider(BitbucketService.authorizeUrl, () => {}, completingAuthCallback);
  };

  const completingAuthCallback = (authorizationResult: AuthorizationResult) => {
    if (authorizationResult.redirectUrl) {
      deploymentCenterData
        .getBitbucketToken(authorizationResult.redirectUrl)
        .then(response => {
          if (response.metadata.success) {
            return deploymentCenterData.storeBitbucketToken(response.data);
          } else {
            // NOTE(michinoy): This is all related to the handshake between us and the provider.
            // If this fails, there isn't much the user can do except retry.
            portalContext.log(
              getTelemetryInfo('error', 'authorizeBitbucketAccount', 'failed', {
                message: getErrorMessage(response.metadata.error),
                error: response.metadata.error,
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

  const getSignedInAsComponent = (isLoading: boolean) => {
    if (isLoading && formProps && formProps.values.bitbucketUser && formProps.values.bitbucketUser.username) {
      return <div>{formProps.values.bitbucketUser.username}</div>;
    } else if (isLoading && (!formProps || !formProps.values.bitbucketUser || !formProps.values.bitbucketUser.username)) {
      return <div>{t('loading')}</div>;
    }
    return <div>{bitbucketUsername}</div>;
  };

  const getUsernameMissingComponent = () => {
    return (
      <div className={deploymentCenterInfoBannerDiv}>
        <CustomBanner
          id="deployment-center-settings-configured-view-user-not-authorized"
          message={
            <>
              {`${t('deploymentCenterSettingsConfiguredViewUserNotAuthorized')} `}
              <Link onClick={authorizeBitbucketAccount} target="_blank">
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
    }

    return branch;
  };

  const getOrgValue = (isLoading: boolean) => {
    if (isLoading && formProps && formProps.values.org) {
      return formProps.values.org;
    } else if (isLoading && (!formProps || !formProps.values.org)) {
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
    setOrg(getOrgValue(isSourceControlLoading));
    setRepo(getRepoValue(isSourceControlLoading));
    setBranch(getBranchValue(isSourceControlLoading));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSourceControlLoading]);

  useEffect(() => {
    getSignedInAsComponent(isBitbucketUsernameLoading);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBitbucketUsernameLoading]);

  return (
    <>
      <h3>{t('deploymentCenterCodeBitbucketTitle')}</h3>

      <ReactiveFormControl id="deployment-center-bitbucket-user" label={t('deploymentCenterOAuthSingedInAs')}>
        <>
          {isBitbucketUsernameMissing && getUsernameMissingComponent()}
          {!isBitbucketUsernameMissing && getSignedInAsComponent(isBitbucketUsernameLoading)}
        </>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-organization" label={t('deploymentCenterOAuthOrganization')}>
        <div>{org}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-repository" label={t('deploymentCenterOAuthRepository')}>
        <div>{repo}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-bitbucket-branch" label={t('deploymentCenterOAuthBranch')}>
        <div>{isSourceControlLoading ? branch : getBranchLink()}</div>
      </ReactiveFormControl>
    </>
  );
};

export default DeploymentCenterBitbucketConfiguredView;
