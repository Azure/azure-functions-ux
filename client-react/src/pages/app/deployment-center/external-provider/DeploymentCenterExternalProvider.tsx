import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Field } from 'formik';
import TextField from '../../../../components/form-controls/TextField';
import { useTranslation } from 'react-i18next';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { RepoTypeOptions } from '../../../../models/external';
import { AuthorizationResult, DeploymentCenterCodeFormData, DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import { authorizeWithProvider, getDescriptionSection, getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { ScmType } from '../../../../models/site/config';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';
import DeploymentCenterGitHubAccount from '../github-provider/DeploymentCenterGitHubAccount';
import DeploymentCenterBitbucketAccount from '../bitbucket-provider/DeploymentCenterBitbucketAccount';
import { GitHubUser } from '../../../../models/github';
import GitHubService from '../../../../ApiHelpers/GitHubService';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { PortalContext } from '../../../../PortalContext';
import { BitbucketUser } from '../../../../models/bitbucket';
import BitbucketService from '../../../../ApiHelpers/BitbucketService';

const DeploymentCenterExternalProvider: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);

  const [repoType, setRepoType] = useState<RepoTypeOptions>(RepoTypeOptions.Public);
  const [showGitHubOAuthButton, setShowGitHubOAuthButton] = useState<boolean>(false);
  const [gitHubUser, setGitHubUser] = useState<GitHubUser | undefined>(undefined);
  const [gitHubAccountStatusMessage, setGitHubAccountStatusMessage] = useState<string | undefined>(
    t('deploymentCenterOAuthFetchingUserInformation')
  );
  const [showBitbucketOAuthButton, setBitbucketOAuthButton] = useState<boolean>(false);
  const [bitbucketUser, setBitbucketUser] = useState<BitbucketUser | undefined>(undefined);
  const [bitbucketAccountStatusMessage, setBitbucketAccountStatusMessage] = useState<string | undefined>(
    t('deploymentCenterOAuthFetchingUserInformation')
  );

  const authorizeGitHubAccount = () => {
    portalContext.log(getTelemetryInfo('info', 'gitHubAccount', 'authorize'));
    authorizeWithProvider(GitHubService.authorizeUrl, startingGitHubAuthCallback, completingGitHubAuthCallBack);
  };

  const completingGitHubAuthCallBack = (authorizationResult: AuthorizationResult) => {
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
      return fetchGitHubData();
    }
  };

  const startingGitHubAuthCallback = (): void => {
    setGitHubAccountStatusMessage(t('deploymentCenterOAuthAuthorizingUser'));
  };

  const fetchGitHubData = async () => {
    portalContext.log(getTelemetryInfo('info', 'getGitHubUser', 'submit'));
    const gitHubUserResponse = await deploymentCenterData.getGitHubUser(deploymentCenterContext.gitHubToken);

    setGitHubAccountStatusMessage(undefined);

    if (gitHubUserResponse.metadata.success && gitHubUserResponse.data.login) {
      // NOTE(michinoy): if unsuccessful, assume the user needs to authorize.
      setGitHubUser(gitHubUserResponse.data);
      formProps.setFieldValue('gitHubUser', gitHubUserResponse.data);
    }
  };

  const authorizeBitbucketAccount = () => {
    portalContext.log(getTelemetryInfo('info', 'bitBucketAccount', 'authorize'));
    authorizeWithProvider(BitbucketService.authorizeUrl, startingBitbucketAuthCallback, completingBitbucketAuthCallBack);
  };

  const completingBitbucketAuthCallBack = (authorizationResult: AuthorizationResult) => {
    if (authorizationResult.redirectUrl) {
      deploymentCenterData.getBitbucketToken(authorizationResult.redirectUrl).then(response => {
        if (response.metadata.success) {
          deploymentCenterData.storeBitbucketToken(response.data).then(() => deploymentCenterContext.refreshUserSourceControlTokens());
        } else {
          portalContext.log(
            getTelemetryInfo('error', 'getBitBucketTokenResponse', 'failed', {
              error: response.metadata.error,
            })
          );
          return Promise.resolve(undefined);
        }
      });
    } else {
      return fetchBitbucketData();
    }
  };

  const startingBitbucketAuthCallback = (): void => {
    setBitbucketAccountStatusMessage(t('deploymentCenterOAuthAuthorizingUser'));
  };

  const fetchBitbucketData = async () => {
    portalContext.log(getTelemetryInfo('info', 'getBitbucketUser', 'submit'));
    const bitbucketUserResponse = await deploymentCenterData.getBitbucketUser(deploymentCenterContext.bitbucketToken);

    setBitbucketAccountStatusMessage(undefined);

    if (bitbucketUserResponse.metadata.success && bitbucketUserResponse.data.username) {
      // NOTE(stpelleg): if unsuccessful, assume the user needs to authorize.
      setBitbucketUser(bitbucketUserResponse.data);
      formProps.setFieldValue('bitbucketUser', bitbucketUserResponse.data);
    }
  };

  useEffect(() => {
    if (formProps) {
      setRepoType(formProps.values.externalRepoType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps && formProps.values.externalRepoType]);

  useEffect(() => {
    if (formProps?.values.repo) {
      if (formProps.values.repo.includes(DeploymentCenterConstants.githubHostname)) {
        setShowGitHubOAuthButton(true);
      } else {
        setShowGitHubOAuthButton(false);
      }

      if (formProps.values.repo.includes(DeploymentCenterConstants.bitbucketHostname)) {
        setBitbucketOAuthButton(true);
      } else {
        setBitbucketOAuthButton(false);
      }
    }
  }, [formProps?.values.repo]);

  useEffect(() => {
    if (!formProps.values.gitHubUser) {
      fetchGitHubData();
    } else {
      setGitHubUser(formProps.values.gitHubUser);
      setGitHubAccountStatusMessage(undefined);
    }
  }, [showGitHubOAuthButton]);

  useEffect(() => {
    if (!formProps.values.bitbucketUser) {
      fetchBitbucketData();
    } else {
      setBitbucketUser(formProps.values.bitbucketUser);
      setBitbucketAccountStatusMessage(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBitbucketOAuthButton]);

  const authentication = useMemo(() => {
    if (showGitHubOAuthButton) {
      return (
        <DeploymentCenterGitHubAccount
          authorizeAccount={authorizeGitHubAccount}
          accountUser={gitHubUser}
          accountStatusMessage={gitHubAccountStatusMessage}
          isExternalGit={true}
        />
      );
    } else if (showBitbucketOAuthButton) {
      return (
        <DeploymentCenterBitbucketAccount
          authorizeAccount={authorizeBitbucketAccount}
          accountUser={bitbucketUser}
          accountStatusMessage={bitbucketAccountStatusMessage}
          isExternalGit={true}
        />
      );
    } else {
      <>
        <Field
          id="deployment-center-external-provider-username"
          label={t('deploymentCenterCodeExternalUsernameLabel')}
          name="externalUsername"
          required={true}
          component={TextField}
        />

        <Field
          id="deployment-center-external-provider-password"
          label={t('deploymentCenterCodeExternalPasswordLabel')}
          name="externalPassword"
          component={TextField}
          required={true}
          type="password"
        />
      </>;
    }
  }, [
    showGitHubOAuthButton,
    gitHubUser,
    gitHubAccountStatusMessage,
    showBitbucketOAuthButton,
    bitbucketUser,
    bitbucketAccountStatusMessage,
  ]);

  return (
    <>
      <h3>{t('deploymentCenterCodeExternalGitTitle')}</h3>

      {getDescriptionSection(ScmType.ExternalGit, t('deploymentCenterExternalGitDescriptionText'))}

      <Field
        id="deployment-center-settings-repository-option"
        label={t('deploymentCenterOAuthRepository')}
        name="repo"
        component={TextField}
        required={true}
        placeholder={t('deploymentCenterCodeExternalRepositoryPlaceholder')}
      />

      <Field
        id="deployment-center-settings-branch-option"
        label={t('deploymentCenterOAuthBranch')}
        name="branch"
        component={TextField}
        required={true}
        placeholder={t('deploymentCenterCodeExternalBranchPlaceholder')}
      />

      <Field
        id="deployment-center-settings-external-private-repo"
        label={t('deploymentCenterCodeExternalRepositoryTypeLabel')}
        name="externalRepoType"
        component={RadioButton}
        options={[
          {
            key: RepoTypeOptions.Public,
            text: t('deploymentCenterCodeExternalPublicRepositoryOption'),
          },
          {
            key: RepoTypeOptions.Private,
            text: t('deploymentCenterCodeExternalPrivateRepositoryOption'),
          },
        ]}
      />

      {repoType === RepoTypeOptions.Private && authentication}
    </>
  );
};

export default DeploymentCenterExternalProvider;
