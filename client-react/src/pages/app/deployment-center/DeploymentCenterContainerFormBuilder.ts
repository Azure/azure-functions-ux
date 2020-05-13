import { ArmObj } from '../../../models/arm-obj';
import { PublishingUser } from '../../../models/site/publish';
import { SiteConfig, ScmTypes } from '../../../models/site/config';
import {
  DeploymentCenterFormData,
  ContainerOptions,
  ContainerRegistrySources,
  ContainerDockerAccessTypes,
  DeploymentCenterYupValidationSchemaType,
} from './DeploymentCenter.types';
import { KeyValue } from '../../../models/portal-models';
import { CommonConstants } from '../../../utils/CommonConstants';
import i18next from 'i18next';
import * as Yup from 'yup';

export class DeploymentCenterContainerFormBuilder {
  private _publishingUser: ArmObj<PublishingUser>;
  private _siteConfig: ArmObj<SiteConfig>;
  private _applicationSettings: ArmObj<KeyValue<string>>;
  private _t: i18next.TFunction;

  constructor(t: i18next.TFunction) {
    this._t = t;
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

  public generateFormData(): DeploymentCenterFormData {
    return {
      publishingUsername: this._publishingUser ? this._publishingUser.properties.publishingUserName : '',
      publishingPassword: '',
      publishingConfirmPassword: '',
      scmType: this._siteConfig ? this._siteConfig.properties.scmType : ScmTypes.None,
      option: ContainerOptions.docker,
      registrySource: this._getContainerRegistrySource(),
      dockerAccessType: ContainerDockerAccessTypes.public,
      serverUrl: '',
      image: '',
      tag: '',
      username: '',
      password: '',
      command: '',
      cicd: false,
    };
  }

  public generateYupValidationSchema(): DeploymentCenterYupValidationSchemaType {
    // NOTE(michinoy): The password should be at least eight characters long and must contain letters and numbers.
    const passwordMinimumRequirementsRegex = new RegExp(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*#?&]{8,}$/);
    const usernameMinLength = 3;

    return Yup.object().shape({
      publishingUsername: Yup.string().test(
        'usernameMinCharsIfEntered',
        this._t('usernameLengthRequirements').format(usernameMinLength),
        value => {
          if (value && value.length < usernameMinLength) {
            return false;
          }
          return true;
        }
      ),
      publishingPassword: Yup.string().test('validateIfNeeded', this._t('userCredsError'), value => {
        return value && passwordMinimumRequirementsRegex.test(value);
      }),
      // NOTE(michinoy): Cannot use the arrow operator for the test function as 'this' context is required.
      publishingConfirmPassword: Yup.string().test('validateIfNeeded', this._t('nomatchpassword'), function(value) {
        return !this.parent.publishingPassword || this.parent.publishingPassword === value;
      }),
      scmType: Yup.mixed().required(),
      option: Yup.mixed().notRequired(),
      registrySource: Yup.mixed().notRequired(),
      dockerAccessType: Yup.mixed().notRequired(),
      serverUrl: Yup.mixed().notRequired(),
      image: Yup.mixed().notRequired(),
      tag: Yup.mixed().notRequired(),
      username: Yup.mixed().notRequired(),
      password: Yup.mixed().notRequired(),
      command: Yup.mixed().notRequired(),
      cicd: Yup.mixed().notRequired(),
    });
  }

  private _getContainerRegistrySource(): ContainerRegistrySources {
    const serverUrl = this._applicationSettings && this._applicationSettings[CommonConstants.ContainerConstants.serverUrlSetting];

    if (serverUrl && serverUrl.indexOf(CommonConstants.ContainerConstants.acrUriHost) > -1) {
      return ContainerRegistrySources.acr;
    } else if (serverUrl && serverUrl.indexOf(CommonConstants.ContainerConstants.dockerHubUrl) > -1) {
      return ContainerRegistrySources.docker;
    } else {
      return ContainerRegistrySources.privateRegistry;
    }
  }
}
