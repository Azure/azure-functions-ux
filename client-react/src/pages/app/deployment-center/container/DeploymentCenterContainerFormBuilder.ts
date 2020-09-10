import { ScmType } from '../../../../models/site/config';
import {
  DeploymentCenterFormData,
  ContainerOptions,
  ContainerRegistrySources,
  ContainerDockerAccessTypes,
  DeploymentCenterYupValidationSchemaType,
  DeploymentCenterContainerFormData,
  ContinuousDeploymentOption,
  AcrFormData,
  DockerHubFormData,
  PrivateRegistryFormData,
} from '../DeploymentCenter.types';
import * as Yup from 'yup';
import { DeploymentCenterFormBuilder } from '../DeploymentCenterFormBuilder';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';

interface FxVersionParts {
  containerOption: ContainerOptions;
  server: string;
  image: string;
  tag: string;
  composeYml: string;
}

export class DeploymentCenterContainerFormBuilder extends DeploymentCenterFormBuilder {
  public generateFormData(): DeploymentCenterFormData<DeploymentCenterContainerFormData> {
    const fxVersionParts = this._getFxVersionParts();
    const serverUrl = this._getServerUrl();
    const username = this._getUsername();
    const password = this._getPassword();

    return {
      scmType: this._siteConfig ? this._siteConfig.properties.scmType : ScmType.None,
      option: this._getContainerOption(),
      registrySource: this._getContainerRegistrySource(),
      command: this._getCommand(),
      gitHubContainerPasswordSecretGuid: '',
      gitHubContainerUsernameSecretGuid: '',
      continuousDeploymentOption: ContinuousDeploymentOption.off,
      ...this._getAcrFormData(serverUrl, username, password, fxVersionParts),
      ...this._getDockerHubFormData(serverUrl, username, password, fxVersionParts),
      ...this._getPrivateRegistryFormData(serverUrl, username, password, fxVersionParts),
      ...this.generateCommonFormData(),
    };
  }

  public generateYupValidationSchema(): DeploymentCenterYupValidationSchemaType<DeploymentCenterContainerFormData> {
    return Yup.object().shape({
      scmType: Yup.mixed().required(this._t('deploymentCenterFieldRequiredMessage')),
      option: Yup.mixed().required(this._t('deploymentCenterFieldRequiredMessage')),
      registrySource: Yup.mixed().required(this._t('deploymentCenterFieldRequiredMessage')),
      command: Yup.mixed().notRequired(),
      gitHubContainerPasswordSecretGuid: Yup.mixed().notRequired(),
      gitHubContainerUsernameSecretGuid: Yup.mixed().notRequired(),
      continuousDeploymentOption: Yup.mixed().required(this._t('deploymentCenterFieldRequiredMessage')),
      ...this._getAcrFormValidationSchema(),
      ...this._getDockerHubFormValidationSchema(),
      ...this._getPrivateRegistryFormValidationSchema(),
      ...this.generateCommonFormYupValidationSchema(),
    });
  }

  private _getAcrFormValidationSchema(): Yup.ObjectSchemaDefinition<AcrFormData> {
    return {
      acrLoginServer: Yup.mixed().test('acrLoginServerRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
        return this.parent.registrySource === ContainerRegistrySources.acr ? !!value : true;
      }),
      acrImage: Yup.mixed().test('acrImageRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
        return this.parent.registrySource === ContainerRegistrySources.acr ? !!value : true;
      }),
      acrTag: Yup.mixed().test('acrTagRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
        return this.parent.registrySource === ContainerRegistrySources.acr ? !!value : true;
      }),
      acrComposeYml: Yup.mixed().test('acrComposeYmlRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
        return this.parent.registrySource === ContainerRegistrySources.acr && this.parent.options === ContainerOptions.compose
          ? !!value
          : true;
      }),
      acrUsername: Yup.mixed().notRequired(),
      acrPassword: Yup.mixed().notRequired(),
      acrResourceId: Yup.mixed().notRequired(),
      acrLocation: Yup.mixed().notRequired(),
    };
  }

  private _getDockerHubFormValidationSchema(): Yup.ObjectSchemaDefinition<DockerHubFormData> {
    return {
      dockerHubImageAndTag: Yup.mixed().test('dockerHubImageAndTagRequired', this._t('deploymentCenterFieldRequiredMessage'), function(
        value
      ) {
        return this.parent.registrySource === ContainerRegistrySources.docker ? !!value : true;
      }),
      dockerHubComposeYml: Yup.mixed().test('dockerHubComposeYmlRequired', this._t('deploymentCenterFieldRequiredMessage'), function(
        value
      ) {
        return this.parent.registrySource === ContainerRegistrySources.docker && this.parent.options === ContainerOptions.compose
          ? !!value
          : true;
      }),
      dockerHubAccessType: Yup.mixed().required(this._t('deploymentCenterFieldRequiredMessage')),
      dockerHubUsername: Yup.mixed().test('dockerHubUsernameRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
        return this.parent.dockerHubAccessType === ContainerDockerAccessTypes.private ? !!value : true;
      }),
      dockerHubPassword: Yup.mixed().test('dockerHubPasswordRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
        return this.parent.dockerHubAccessType === ContainerDockerAccessTypes.private ? !!value : true;
      }),
    };
  }

  private _getPrivateRegistryFormValidationSchema(): Yup.ObjectSchemaDefinition<PrivateRegistryFormData> {
    return {
      privateRegistryServerUrl: Yup.mixed()
        .test('privateRegistryServerUrlRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
          return this.parent.registrySource === ContainerRegistrySources.privateRegistry ? !!value : true;
        })
        .test('privateRegistryServerUrlIsUrl', this._t('deploymentCenterServerUrlIsUrl'), function(value) {
          return this.parent.registrySource === ContainerRegistrySources.privateRegistry ? !!value && value.startsWith('https://') : true;
        }),
      privateRegistryImageAndTag: Yup.mixed().test(
        'privateRegistryImageAndTagRequired',
        this._t('deploymentCenterFieldRequiredMessage'),
        function(value) {
          return this.parent.registrySource === ContainerRegistrySources.privateRegistry ? !!value : true;
        }
      ),
      privateRegistryComposeYml: Yup.mixed().test(
        'privateRegistryComposeYmlRequired',
        this._t('deploymentCenterFieldRequiredMessage'),
        function(value) {
          return this.parent.registrySource === ContainerRegistrySources.docker && this.parent.options === ContainerOptions.compose
            ? !!value
            : true;
        }
      ),
      privateRegistryUsername: Yup.mixed().test(
        'privateRegistryUsernameRequired',
        this._t('deploymentCenterFieldRequiredMessage'),
        function(value) {
          return !!this.parent.privateRegistryPassword ? !!value : true;
        }
      ),
      privateRegistryPassword: Yup.mixed().test(
        'privateRegistryPasswordRequired',
        this._t('deploymentCenterFieldRequiredMessage'),
        function(value) {
          return !!this.parent.privateRegistryUsername ? !!value : true;
        }
      ),
    };
  }

  private _getContainerOption(): ContainerOptions {
    // TODO(michinoy): For now we will only support docker (single container) option. See following work item for enabling compose:
    // https://msazure.visualstudio.com/Antares/_workitems/edit/8238865
    return ContainerOptions.docker;
  }

  private _getContainerRegistrySource(): ContainerRegistrySources {
    const serverUrl = this._getServerUrl();

    if (this._isServerUrlAcr(serverUrl)) {
      return ContainerRegistrySources.acr;
    } else if (this._isServerUrlDockerHub(serverUrl)) {
      return ContainerRegistrySources.docker;
    } else {
      return ContainerRegistrySources.privateRegistry;
    }
  }

  private _getServerUrl(): string {
    const value = this._applicationSettings && this._applicationSettings.properties[DeploymentCenterConstants.serverUrlSetting];
    return value ? value.toLocaleLowerCase() : '';
  }

  private _getUsername(): string {
    const value = this._applicationSettings && this._applicationSettings.properties[DeploymentCenterConstants.usernameSetting];
    return value ? value : '';
  }

  private _getPassword(): string {
    const value = this._applicationSettings && this._applicationSettings.properties[DeploymentCenterConstants.passwordSetting];
    return value ? value : '';
  }

  private _getCommand(): string {
    return this._siteConfig && this._siteConfig.properties.appCommandLine ? this._siteConfig.properties.appCommandLine : '';
  }

  private _getFxVersionParts(): FxVersionParts {
    if (!this._siteConfig) {
      return {
        server: '',
        image: '',
        tag: '',
        containerOption: ContainerOptions.docker,
        composeYml: '',
      };
    }

    // NOTE(michinoy): Depending on the OS you would either have linuxFxVersion or windowsFxVersion.
    // Depending on the container option (single/docker or compose) the fxVersion value could either contain
    // the registry source or an encoded yml file (yeah I know!). Following are some examples:
    // compose fxVersion: COMPOSE|<base64Encoded string>
    // docker fxVersion with serverPath: DOCKER|<serverPath>/<imageName>:<tag>
    // docker fxVersion without serverPath: DOCKER|<imageName>:<tag>
    // docker fxVersion without tag: DOCKER|<image>
    const fxVersion = this._siteConfig.properties.linuxFxVersion || this._siteConfig.properties.windowsFxVersion;
    const fxVersionParts = fxVersion.split('|');

    if (fxVersionParts.length < 2) {
      throw Error(`Incorrect fxVersion set in the site config: ${fxVersion}`);
    }

    if (this._isComposeContainerOption(fxVersion)) {
      return {
        server: '',
        image: '',
        tag: '',
        containerOption: ContainerOptions.compose,
        composeYml: btoa(fxVersionParts[1]),
      };
    } else {
      const registryParts = fxVersionParts[1].split(':');
      const imageParts = registryParts[0].split('/');
      const tag = registryParts[1] ? registryParts[1] : '';
      const image = imageParts.length > 1 ? imageParts[1] : imageParts[0];
      const server = imageParts.length > 1 ? imageParts[0] : '';

      return {
        server,
        image,
        tag,
        containerOption: ContainerOptions.docker,
        composeYml: '',
      };
    }
  }

  private _getAcrFormData(serverUrl: string, username: string, password: string, fxVersionParts: FxVersionParts): AcrFormData {
    if (this._isServerUrlAcr(serverUrl)) {
      return {
        acrLoginServer: fxVersionParts.server.toLocaleLowerCase(),
        acrImage: fxVersionParts.image,
        acrTag: fxVersionParts.tag,
        acrComposeYml: fxVersionParts.composeYml,
        acrUsername: username,
        acrPassword: password,
        acrResourceId: '',
        acrLocation: '',
      };
    } else {
      return {
        acrLoginServer: '',
        acrImage: '',
        acrTag: '',
        acrComposeYml: '',
        acrUsername: '',
        acrPassword: '',
        acrResourceId: '',
        acrLocation: '',
      };
    }
  }

  private _getDockerHubFormData(serverUrl: string, username: string, password: string, fxVersionParts: FxVersionParts): DockerHubFormData {
    if (this._isServerUrlDockerHub(serverUrl)) {
      return {
        dockerHubImageAndTag: fxVersionParts.tag ? `${fxVersionParts.image}:${fxVersionParts.tag}` : fxVersionParts.image,
        dockerHubComposeYml: fxVersionParts.composeYml,
        dockerHubAccessType: username && password ? ContainerDockerAccessTypes.private : ContainerDockerAccessTypes.public,
        dockerHubUsername: username,
        dockerHubPassword: password,
      };
    } else {
      return {
        dockerHubImageAndTag: '',
        dockerHubComposeYml: '',
        dockerHubAccessType: ContainerDockerAccessTypes.public,
        dockerHubUsername: '',
        dockerHubPassword: '',
      };
    }
  }

  private _getPrivateRegistryFormData(
    serverUrl: string,
    username: string,
    password: string,
    fxVersionParts: FxVersionParts
  ): PrivateRegistryFormData {
    if (!this._isServerUrlAcr(serverUrl) && !this._isServerUrlDockerHub(serverUrl)) {
      return {
        privateRegistryServerUrl: serverUrl,
        privateRegistryImageAndTag: fxVersionParts.tag ? `${fxVersionParts.image}:${fxVersionParts.tag}` : fxVersionParts.image,
        privateRegistryComposeYml: fxVersionParts.composeYml,
        privateRegistryUsername: username,
        privateRegistryPassword: password,
      };
    } else {
      return {
        privateRegistryServerUrl: '',
        privateRegistryImageAndTag: '',
        privateRegistryComposeYml: '',
        privateRegistryUsername: '',
        privateRegistryPassword: '',
      };
    }
  }

  private _isServerUrlAcr(serverUrl: string): boolean {
    return !!serverUrl && serverUrl.indexOf(DeploymentCenterConstants.acrUriHost) > -1;
  }

  private _isServerUrlDockerHub(serverUrl: string): boolean {
    return !!serverUrl && serverUrl.indexOf(DeploymentCenterConstants.dockerHubUrl) > -1;
  }

  private _isComposeContainerOption(fxVersion: string): boolean {
    const fxVersionParts = fxVersion ? fxVersion.split('|') : [];
    return fxVersionParts[0].toLocaleLowerCase() === DeploymentCenterConstants.composePrefix.toLocaleLowerCase();
  }
}
