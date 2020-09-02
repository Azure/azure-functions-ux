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
      scmType: Yup.mixed().required(),
      option: Yup.mixed().notRequired(),
      registrySource: Yup.mixed().notRequired(),
      command: Yup.mixed().notRequired(),
      gitHubContainerPasswordSecretGuid: Yup.mixed().notRequired(),
      gitHubContainerUsernameSecretGuid: Yup.mixed().notRequired(),
      continuousDeploymentOption: Yup.mixed().required(),
      ...this._getAcrFormValidationSchema(),
      ...this._getDockerHubFormValidationSchema(),
      ...this._getPrivateRegistryFormValidationSchema(),
      ...this.generateCommonFormYupValidationSchema(),
    });
  }

  private _getAcrFormValidationSchema(): Yup.ObjectSchemaDefinition<AcrFormData> {
    return {
      acrLoginServer: Yup.mixed().notRequired(),
      acrImage: Yup.mixed().notRequired(),
      acrTag: Yup.mixed().notRequired(),
      acrComposeYml: Yup.mixed().notRequired(),
      acrUsername: Yup.mixed().notRequired(),
      acrPassword: Yup.mixed().notRequired(),
      acrResourceId: Yup.mixed().notRequired(),
      acrLocation: Yup.mixed().notRequired(),
    };
  }

  private _getDockerHubFormValidationSchema(): Yup.ObjectSchemaDefinition<DockerHubFormData> {
    return {
      dockerHubImageAndTag: Yup.mixed().notRequired(),
      dockerHubComposeYml: Yup.mixed().notRequired(),
      dockerHubAccessType: Yup.mixed().notRequired(),
      dockerHubUsername: Yup.mixed().notRequired(),
      dockerHubPassword: Yup.mixed().notRequired(),
    };
  }

  private _getPrivateRegistryFormValidationSchema(): Yup.ObjectSchemaDefinition<PrivateRegistryFormData> {
    return {
      privateRegistryServerUrl: Yup.mixed().notRequired(),
      privateRegistryImageAndTag: Yup.mixed().notRequired(),
      privateRegistryComposeYml: Yup.mixed().notRequired(),
      privateRegistryUsername: Yup.mixed().notRequired(),
      privateRegistryPassword: Yup.mixed().notRequired(),
    };
  }

  private _getContainerOption(): ContainerOptions {
    const fxVersion = this._siteConfig.properties.linuxFxVersion || this._siteConfig.properties.windowsFxVersion;
    const fxVersionParts = fxVersion ? fxVersion.split('|') : [];

    if (fxVersionParts[0].toLocaleLowerCase() === DeploymentCenterConstants.composePrefix) {
      return ContainerOptions.compose;
    } else {
      return ContainerOptions.docker;
    }
  }

  private _getContainerRegistrySource(): ContainerRegistrySources {
    const serverUrl = this._getServerUrl().toLocaleLowerCase();

    if (serverUrl && serverUrl.indexOf(DeploymentCenterConstants.acrUriHost) > -1) {
      return ContainerRegistrySources.acr;
    } else if (serverUrl && serverUrl.indexOf(DeploymentCenterConstants.dockerHubUrl) > -1) {
      return ContainerRegistrySources.docker;
    } else {
      return ContainerRegistrySources.privateRegistry;
    }
  }

  private _getServerUrl(): string {
    const value = this._applicationSettings && this._applicationSettings.properties[DeploymentCenterConstants.serverUrlSetting];
    return value ? value : '';
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

    if (fxVersionParts[0].toLocaleLowerCase() === DeploymentCenterConstants.composePrefix.toLocaleLowerCase()) {
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
    if (serverUrl.toLocaleLowerCase().indexOf(DeploymentCenterConstants.acrUriHost) > -1) {
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
    if (serverUrl.toLocaleLowerCase() === DeploymentCenterConstants.dockerHubUrl) {
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
    if (
      serverUrl.toLocaleLowerCase().indexOf(DeploymentCenterConstants.acrUriHost) === -1 &&
      serverUrl.toLocaleLowerCase() !== DeploymentCenterConstants.dockerHubUrl
    ) {
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
}
