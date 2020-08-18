import React, { useContext, useEffect, useState } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { LogCategories } from '../../../../utils/LogCategories';
import LogService from '../../../../utils/LogService';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { useTranslation } from 'react-i18next';
import { additionalTextFieldControl, deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import { Link, Icon } from 'office-ui-fabric-react';

const DeploymentCenterBitbucketConfiguredView: React.FC<{}> = props => {
  const { t } = useTranslation();
  const [org, setOrg] = useState<string | undefined>(undefined);
  const [repo, setRepo] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [repoUrl, setRepoUrl] = useState<string | undefined>(undefined);
  const [bitbucketUsername, setbitbucketUsername] = useState<string>(t('loading'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterData = new DeploymentCenterData();

  const getSourceControlDetails = async () => {
    setIsLoading(true);
    const getBitbucketUserRequest = deploymentCenterData.getBitbucketUser(deploymentCenterContext.bitbucketToken);
    const getSourceControlDetailsResponse = deploymentCenterData.getSourceControlDetails(deploymentCenterContext.resourceId);

    const [bitbucketUserResponse, sourceControlDetailsResponse] = await Promise.all([
      getBitbucketUserRequest,
      getSourceControlDetailsResponse,
    ]);

    if (sourceControlDetailsResponse.metadata.success) {
      setRepoUrl(sourceControlDetailsResponse.data.properties.repoUrl);
      setBranch(sourceControlDetailsResponse.data.properties.branch);

      const repoUrlSplit = sourceControlDetailsResponse.data.properties.repoUrl.split('/');
      if (repoUrlSplit.length >= 2) {
        setOrg(repoUrlSplit[repoUrlSplit.length - 2]);
        setRepo(repoUrlSplit[repoUrlSplit.length - 1]);
      }
    } else {
      setRepoUrl(t('deploymentCenterErrorFetchingInfo'));
      setOrg(t('deploymentCenterErrorFetchingInfo'));
      setRepo(t('deploymentCenterErrorFetchingInfo'));
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterSourceControls',
        `Failed to get source control details with error: ${getErrorMessage(sourceControlDetailsResponse.metadata.error)}`
      );
    }

    if (bitbucketUserResponse.metadata.success && bitbucketUserResponse.data.username) {
      setbitbucketUsername(bitbucketUserResponse.data.username);
    } else {
      // NOTE(stpelleg): if unsuccessful, assume the user needs to authorize.
      setbitbucketUsername('');

      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenterBitbucketConfiguredView',
        `Failed to get Bitbucket user details with error: ${getErrorMessage(bitbucketUserResponse.metadata.error)}`
      );
    }

    setIsLoading(false);
  };

  const getSignedInAsComponent = () => {
    if (bitbucketUsername) {
      return (
        <ReactiveFormControl id="deployment-center-bitbucket-user" label={t('deploymentCenterOAuthSingedInAs')}>
          <div>{`${bitbucketUsername}`}</div>
        </ReactiveFormControl>
      );
    } else {
      return (
        <div className={deploymentCenterInfoBannerDiv}>
          {
            //TODO(stpelleg): Implement OAuth #8026655
          }
        </div>
      );
    }
  };

  const getBranchLink = () => {
    if (branch) {
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
    } else {
      return t('deploymentCenterErrorFetchingInfo');
    }
  };

  useEffect(() => {
    getSourceControlDetails();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h3>{t('deploymentCenterCodeBitbucketTitle')}</h3>

      {isLoading ? (
        <ReactiveFormControl id="deployment-center-bitbucket-user" label={t('deploymentCenterOAuthSingedInAs')}>
          <div>{t('loading')}</div>
        </ReactiveFormControl>
      ) : (
        getSignedInAsComponent()
      )}
      <ReactiveFormControl id="deployment-center-organization" label={t('deploymentCenterOAuthOrganization')}>
        <div>{isLoading ? t('loading') : org}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-repository" label={t('deploymentCenterOAuthRepository')}>
        <div>{isLoading ? t('loading') : repo}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-bitbucket-branch" label={t('deploymentCenterOAuthBranch')}>
        <div>{isLoading ? t('loading') : getBranchLink()}</div>
      </ReactiveFormControl>
    </>
  );
};

export default DeploymentCenterBitbucketConfiguredView;
