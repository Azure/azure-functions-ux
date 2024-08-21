import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
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
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { SiteStateContext } from '../../../../SiteState';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { IconConstants } from '../../../../utils/constants/IconConstants';
import { ThemeContext } from '../../../../ThemeContext';
import { IconGridCell } from '../../../../components/IconGridCell/IconGridCell';
import { style } from 'typestyle';

const DeploymentCenterExternalProvider: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const scenarioService = new ScenarioService(t);

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);
  const theme = useContext(ThemeContext);
  const { site } = useContext(SiteStateContext);

  const [isGitHubOAuthSupported, setIsGitHubOAuthSupported] = useState<boolean>(false);
  const [fetchGitHubAccount, setFetchGitHubAccount] = useState<boolean>(false);
  const [gitHubUser, setGitHubUser] = useState<GitHubUser | undefined>(undefined);
  const [gitHubAccountStatusMessage, setGitHubAccountStatusMessage] = useState<string | undefined>(
    t('deploymentCenterOAuthFetchingUserInformation')
  );
  const [isBitbucketOAuthSupported, setIsBitbucketOAuthSupported] = useState<boolean>(false);
  const [fetchBitbucketAccount, setFetchBitbucketAccount] = useState<boolean>(false);
  const [bitbucketUser, setBitbucketUser] = useState<BitbucketUser | undefined>(undefined);
  const [bitbucketAccountStatusMessage, setBitbucketAccountStatusMessage] = useState<string | undefined>(
    t('deploymentCenterOAuthFetchingUserInformation')
  );

  useEffect(() => {
    if (site) {
      setIsGitHubOAuthSupported(scenarioService.checkScenario(ScenarioIds.githubSource, { site }).status !== 'disabled');
      setIsBitbucketOAuthSupported(scenarioService.checkScenario(ScenarioIds.bitbucketSource, { site }).status !== 'disabled');
    }
  }, [site]);

  const authorizeGitHubAccount = useCallback(() => {
    portalContext.log(getTelemetryInfo('info', 'gitHubAccount', 'authorize'));
    authorizeWithProvider(GitHubService.authorizeUrl, startingGitHubAuthCallback, completingGitHubAuthCallBack);
  }, []);

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

  const authorizeBitbucketAccount = useCallback(() => {
    portalContext.log(getTelemetryInfo('info', 'bitBucketAccount', 'authorize'));
    authorizeWithProvider(BitbucketService.authorizeUrl, startingBitbucketAuthCallback, completingBitbucketAuthCallBack);
  }, []);

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
    if (fetchGitHubAccount) {
      if (!formProps.values.gitHubUser) {
        fetchGitHubData();
      } else {
        setGitHubUser(formProps.values.gitHubUser);
        setGitHubAccountStatusMessage(undefined);
      }
    }
  }, [fetchGitHubAccount]);

  useEffect(() => {
    if (fetchBitbucketAccount) {
      if (!formProps.values.bitbucketUser) {
        fetchBitbucketData();
      } else {
        setBitbucketUser(formProps.values.bitbucketUser);
        setBitbucketAccountStatusMessage(undefined);
      }
    }
  }, [fetchBitbucketAccount]);

  const getAuthNotSupportedError = useCallback((error: string) => {
    return (
      <ReactiveFormControl id="deployment-center-external-private-text" pushContentRight={true}>
        <IconGridCell
          text={<div style={{ color: theme.semanticColors.errorText }}>{error}</div>}
          iconName={IconConstants.IconNames.ErrorBadgeFilled}
          style={{ color: theme.semanticColors.errorIcon, marginTop: '2px' }}
        />
      </ReactiveFormControl>
    );
  }, []);

  const authSettings = useMemo(() => {
    if (formProps?.values?.externalRepoType === RepoTypeOptions.Private) {
      const repository = formProps?.values?.repo ?? '';
      if (repository.includes(DeploymentCenterConstants.githubHostname)) {
        setFetchGitHubAccount(isGitHubOAuthSupported);
        return isGitHubOAuthSupported ? (
          <DeploymentCenterGitHubAccount
            authorizeAccount={authorizeGitHubAccount}
            accountUser={gitHubUser}
            accountStatusMessage={gitHubAccountStatusMessage}
            isExternalGit={true}
          />
        ) : (
          getAuthNotSupportedError(t('externalGitPrivateGitHubNotSupported'))
        );
      } else if (repository.includes(DeploymentCenterConstants.bitbucketHostname)) {
        setFetchBitbucketAccount(isBitbucketOAuthSupported);
        return isBitbucketOAuthSupported ? (
          <DeploymentCenterBitbucketAccount
            authorizeAccount={authorizeBitbucketAccount}
            accountUser={bitbucketUser}
            accountStatusMessage={bitbucketAccountStatusMessage}
            isExternalGit={true}
          />
        ) : (
          getAuthNotSupportedError(t('externalGitPrivateBitbucketNotSupported'))
        );
      } else {
        return (
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
          </>
        );
      }
    }
  }, [
    formProps?.values?.externalRepoType,
    formProps?.values?.repo,
    isGitHubOAuthSupported,
    authorizeGitHubAccount,
    gitHubUser,
    gitHubAccountStatusMessage,
    isBitbucketOAuthSupported,
    authorizeBitbucketAccount,
    bitbucketUser,
    bitbucketAccountStatusMessage,
    t,
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
        formControlClassName={style({
          marginBottom: '2px !important',
        })}
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

      {formProps?.values?.externalRepoType === RepoTypeOptions.Private && authSettings}
    </>
  );
};

export default DeploymentCenterExternalProvider;
