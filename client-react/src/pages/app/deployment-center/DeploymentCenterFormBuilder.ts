import { ArmObj } from '../../../models/arm-obj';
import { PublishingUser } from '../../../models/site/publish';
import { SiteConfig, BuildProvider, ScmType } from '../../../models/site/config';
import { AuthType, DeploymentCenterFormData, DeploymentCenterYupValidationSchemaType, WorkflowOption } from './DeploymentCenter.types';
import i18next from 'i18next';
import { KeyValue } from '../../../models/portal-models';
import * as Yup from 'yup';
import { RepoTypeOptions } from '../../../models/external';
import { CommonConstants } from '../../../utils/CommonConstants';
import { PublishingCredentialPolicies } from '../../../models/site/site';

export abstract class DeploymentCenterFormBuilder {
  protected _publishingUser: ArmObj<PublishingUser>;
  protected _basicPublishingCredentialsPolicies: PublishingCredentialPolicies;
  protected _siteConfig: ArmObj<SiteConfig>;
  protected _applicationSettings: ArmObj<KeyValue<string>>;
  protected _configMetadata: ArmObj<KeyValue<string>>;
  protected _t: i18next.TFunction;

  constructor(t: i18next.TFunction) {
    this._t = t;
  }

  protected generateCommonFormData() {
    return {
      publishingUsername:
        this._publishingUser && this._publishingUser.properties.publishingUserName
          ? this._publishingUser.properties.publishingUserName
          : '',
      publishingPassword:
        this._publishingUser && this._publishingUser.properties.publishingPassword
          ? this._publishingUser.properties.publishingPassword
          : '',
      publishingConfirmPassword: '',
      workflowOption: WorkflowOption.None,
      org: '',
      repo: '',
      branch: '',
      gitHubUser: undefined,
      bitbucketUser: undefined,
      gitHubPublishProfileSecretGuid: '',
      externalRepoType: RepoTypeOptions.Public,
      devOpsProject: '',
      authType: AuthType.Oidc,
      authIdentity: {
        id: '',
        name: '',
        location: '',
        properties: {
          clientId: '',
          principalId: '',
          tenantId: '',
        },
      },
    };
  }

  protected generateCommonFormYupValidationSchema() {
    // NOTE(michinoy): The password should be at least eight characters long and must contain letters, numbers, and symbol.
    const passwordMinimumRequirementsRegex = new RegExp(/^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,})$/);
    const usernameMinLength = 3;
    const getPublishingUsername = () => {
      return this._publishingUser && this._publishingUser.properties ? this._publishingUser.properties.publishingUserName : '';
    };

    return {
      publishingUsername: Yup.string()
        .test('usernameMinCharsIfEntered', this._t('usernameLengthRequirements').format(usernameMinLength), value => {
          return !value || value.length >= usernameMinLength;
        })
        .test('validatePublishingUsername', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
          return value || !this.parent.publishingPassword;
        }),
      publishingPassword: Yup.string()
        .test('publishingPasswordRequirements', this._t('userCredsError'), value => {
          return !value || passwordMinimumRequirementsRegex.test(value);
        })
        .test('passwordRequiredWhenUsernameChanged', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
          return this.parent.publishingUsername && this.parent.publishingUsername !== getPublishingUsername() ? value : true;
        }),
      // NOTE(michinoy): Cannot use the arrow operator for the test function as 'this' context is required.
      publishingConfirmPassword: Yup.string()
        .test('validatePublishingConfirmPassword', this._t('nomatchpassword'), function(value) {
          return !this.parent.publishingPassword || this.parent.publishingPassword === value;
        })
        .test('confirmPasswordRequiredWhenUsernameChanged', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
          return this.parent.publishingUsername && this.parent.publishingUsername !== getPublishingUsername() ? value : true;
        }),
      workflowOption: Yup.mixed().test('workflowOptionRequired', this._t('deploymentCenterFieldRequiredMessage'), function() {
        return this.parent.buildProvider === BuildProvider.GitHubAction
          ? this.parent.branch && this.parent.workflowOption !== 'none'
          : true;
      }),
      org: Yup.mixed().test('organizationRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
        return this.parent.sourceProvider === ScmType.GitHubAction ||
          this.parent.sourceProvider === ScmType.GitHub ||
          this.parent.sourceProvider === ScmType.BitbucketGit ||
          this.parent.sourceProvider === ScmType.Vsts
          ? !!value
          : true;
      }),
      repo: Yup.mixed().test('repositoryRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
        return this.parent.sourceProvider === ScmType.GitHubAction ||
          this.parent.sourceProvider === ScmType.GitHub ||
          this.parent.sourceProvider === ScmType.BitbucketGit ||
          this.parent.sourceProvider === ScmType.ExternalGit ||
          this.parent.sourceProvider === ScmType.Vsts
          ? !!value
          : true;
      }),
      branch: Yup.mixed().test('branchRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
        return this.parent.sourceProvider === ScmType.GitHubAction ||
          this.parent.sourceProvider === ScmType.GitHub ||
          this.parent.sourceProvider === ScmType.BitbucketGit ||
          this.parent.sourceProvider === ScmType.ExternalGit ||
          this.parent.sourceProvider === ScmType.Vsts
          ? !!value
          : true;
      }),
      gitHubUser: Yup.mixed().notRequired(),
      bitbucketUser: Yup.mixed().notRequired(),
      gitHubPublishProfileSecretGuid: Yup.mixed().notRequired(),
      externalUsername: Yup.mixed()
        .test('externalUsernameRequired', this._t('deploymentCenterFieldPrivateSSHMessage'), function(value) {
          const isRepoSSH =
            this.parent.sourceProvider === ScmType.ExternalGit &&
            this.parent.externalRepoType === RepoTypeOptions.Private &&
            !!this.parent.repo &&
            !(
              this.parent.repo.startsWith(CommonConstants.DeploymentCenterConstants.https) ||
              this.parent.repo.startsWith(CommonConstants.DeploymentCenterConstants.http)
            );
          return isRepoSSH ? !value : true;
        })
        .test('externalUsernameRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
          return this.parent.externalRepoType === RepoTypeOptions.Private ? !!value : true;
        }),
      externalPassword: Yup.mixed()
        .test('externalPasswordRequired', this._t('deploymentCenterFieldPrivateSSHMessage'), function(value) {
          const isRepoSSH =
            this.parent.sourceProvider === ScmType.ExternalGit &&
            this.parent.externalRepoType === RepoTypeOptions.Private &&
            !!this.parent.repo &&
            !(
              this.parent.repo.startsWith(CommonConstants.DeploymentCenterConstants.https) ||
              this.parent.repo.startsWith(CommonConstants.DeploymentCenterConstants.http)
            );
          return isRepoSSH ? !value : true;
        })
        .test('externalPasswordRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
          return this.parent.externalRepoType === RepoTypeOptions.Private ? !!value : true;
        }),
      externalRepoType: Yup.mixed().notRequired(),
      devOpsProjectName: Yup.mixed().notRequired(),
      authType: Yup.mixed().test('authTypeRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
        return this.parent.buildProvider === BuildProvider.GitHubAction ? !!value : true;
      }),
      authIdentity: Yup.mixed().test('authIdentityRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
        return this.parent.buildProvider === BuildProvider.GitHubAction && this.parent.authType === AuthType.Oidc
          ? !!value.resourceId
          : true;
      }),
      hasPermissionToUseOIDC: Yup.boolean().notRequired(),
    };
  }

  public setPublishingUser(publishingUser: ArmObj<PublishingUser>) {
    this._publishingUser = publishingUser;
  }

  public setBasicPublishingCredentialsPolicies(policies: PublishingCredentialPolicies) {
    this._basicPublishingCredentialsPolicies = policies;
  }

  public setSiteConfig(siteConfig: ArmObj<SiteConfig>) {
    this._siteConfig = siteConfig;
  }

  public setApplicationSettings(applicationSettings: ArmObj<KeyValue<string>>) {
    this._applicationSettings = applicationSettings;
  }

  public setConfigMetadata(configMetadata: ArmObj<KeyValue<string>>) {
    this._configMetadata = configMetadata;
  }

  public abstract generateFormData(): DeploymentCenterFormData;

  public abstract generateYupValidationSchema(): DeploymentCenterYupValidationSchemaType;
}
