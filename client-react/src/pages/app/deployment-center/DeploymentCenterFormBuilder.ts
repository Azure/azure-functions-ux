import { ArmObj } from '../../../models/arm-obj';
import { PublishingUser } from '../../../models/site/publish';
import { SiteConfig } from '../../../models/site/config';
import { DeploymentCenterFormData, DeploymentCenterYupValidationSchemaType, WorkflowOption } from './DeploymentCenter.types';
import i18next from 'i18next';
import { KeyValue } from '../../../models/portal-models';
import * as Yup from 'yup';

export abstract class DeploymentCenterFormBuilder {
  protected _publishingUser: ArmObj<PublishingUser>;
  protected _siteConfig: ArmObj<SiteConfig>;
  protected _applicationSettings: ArmObj<KeyValue<string>>;
  protected _configMetadata: ArmObj<KeyValue<string>>;
  protected _t: i18next.TFunction;

  constructor(t: i18next.TFunction) {
    this._t = t;
  }

  protected generateCommonFormData() {
    return {
      publishingUsername: this._publishingUser ? this._publishingUser.properties.publishingUserName : '',
      publishingPassword: '',
      publishingConfirmPassword: '',
      workflowOption: WorkflowOption.None,
      org: '',
      repo: '',
      branch: '',
    };
  }

  protected generateCommonFormYupValidationSchema() {
    // NOTE(michinoy): The password should be at least eight characters long and must contain letters, numbers, and symbol.
    const passwordMinimumRequirementsRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/);
    const usernameMinLength = 3;

    return {
      publishingUsername: Yup.string().test(
        'usernameMinCharsIfEntered',
        this._t('usernameLengthRequirements').format(usernameMinLength),
        value => {
          return !value || value.length >= usernameMinLength;
        }
      ),
      publishingPassword: Yup.string().test('validateIfNeeded', this._t('userCredsError'), value => {
        return !value || passwordMinimumRequirementsRegex.test(value);
      }),
      // NOTE(michinoy): Cannot use the arrow operator for the test function as 'this' context is required.
      publishingConfirmPassword: Yup.string().test('validateIfNeeded', this._t('nomatchpassword'), function(value) {
        return !this.parent.publishingPassword || this.parent.publishingPassword === value;
      }),
      // TODO(t-kakan): Need to do correct validation in later PR for DeploymentCenterFormBuilder, DeploymentCenterCodeFormBuilder, DeploymentCenterContainerFormBuilder,
      workflowOption: Yup.mixed().notRequired(),
      org: Yup.mixed().notRequired(),
      repo: Yup.mixed().notRequired(),
      branch: Yup.mixed().notRequired(),
    };
  }

  public setPublishingUser(publishingUser: ArmObj<PublishingUser>) {
    this._publishingUser = publishingUser;
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
