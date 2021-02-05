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
import * as yamlLint from 'yaml-lint';

interface YamlValidationResult {
  valid: boolean;
  errorMessage?: string;
}

interface FxVersionParts {
  containerOption: ContainerOptions;
  server: string;
  image: string;
  tag: string;
  composeYml: string;
}

export class DeploymentCenterContainerFormBuilder extends DeploymentCenterFormBuilder {
  public generateFormData(): DeploymentCenterFormData<DeploymentCenterContainerFormData> {
    const serverUrl = this._getServerUrl();
    const username = this._getUsername();
    const password = this._getPassword();
    const fxVersionParts = this._getFxVersionParts(serverUrl, username);

    return {
      scmType: this._siteConfig ? this._siteConfig.properties.scmType : ScmType.None,
      option: fxVersionParts.containerOption,
      registrySource: this._getContainerRegistrySource(),
      command: this._getCommand(),
      gitHubContainerPasswordSecretGuid: '',
      gitHubContainerUsernameSecretGuid: '',
      continuousDeploymentOption: this._getContinuousDeploymentOption(),
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
    const validateYaml = (yaml: string) => this._validateYaml(yaml);

    return {
      acrLoginServer: Yup.mixed().test('acrLoginServerRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
        return this.parent.registrySource === ContainerRegistrySources.acr ? !!value : true;
      }),
      acrImage: Yup.mixed().test('acrImageRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
        return this.parent.registrySource === ContainerRegistrySources.acr && this.parent.option !== ContainerOptions.compose
          ? !!value
          : true;
      }),
      acrTag: Yup.mixed().test('acrTagRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
        return this.parent.registrySource === ContainerRegistrySources.acr && this.parent.option !== ContainerOptions.compose
          ? !!value
          : true;
      }),
      acrComposeYml: Yup.mixed()
        .test('acrComposeYmlRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
          return this.parent.registrySource === ContainerRegistrySources.acr && this.parent.option === ContainerOptions.compose
            ? !!value
            : true;
        })
        .test('acrComposeYmlValidation', this._t('deploymentCenterInvalidYaml'), function(value) {
          return validateYaml(value).then(result => {
            if (!result.valid) {
              return this.createError({
                message: result.errorMessage,
              });
            }

            return result.valid;
          });
        }),
      acrUsername: Yup.mixed().notRequired(),
      acrPassword: Yup.mixed().notRequired(),
      acrResourceId: Yup.mixed().notRequired(),
      acrLocation: Yup.mixed().notRequired(),
    };
  }

  private _getDockerHubFormValidationSchema(): Yup.ObjectSchemaDefinition<DockerHubFormData> {
    const validateYaml = (yaml: string) => this._validateYaml(yaml);

    return {
      dockerHubImageAndTag: Yup.mixed().test('dockerHubImageAndTagRequired', this._t('deploymentCenterFieldRequiredMessage'), function(
        value
      ) {
        return this.parent.registrySource === ContainerRegistrySources.docker && this.parent.option !== ContainerOptions.compose
          ? !!value
          : true;
      }),
      dockerHubComposeYml: Yup.mixed()
        .test('dockerHubComposeYmlRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
          return this.parent.registrySource === ContainerRegistrySources.docker && this.parent.option === ContainerOptions.compose
            ? !!value
            : true;
        })
        .test('dockerHubComposeYmlValidation', this._t('deploymentCenterInvalidYaml'), function(value) {
          return validateYaml(value).then(result => {
            if (!result.valid) {
              return this.createError({
                message: result.errorMessage,
              });
            }

            return result.valid;
          });
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
    const validateYaml = (yaml: string) => this._validateYaml(yaml);

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
          return this.parent.registrySource === ContainerRegistrySources.privateRegistry && this.parent.option !== ContainerOptions.compose
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
      privateRegistryComposeYml: Yup.mixed()
        .test('privateRegistryComposeYmlRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
          return this.parent.registrySource === ContainerRegistrySources.privateRegistry && this.parent.option === ContainerOptions.compose
            ? !!value
            : true;
        })
        .test('privateRegistryComposeYmlValidation', this._t('deploymentCenterInvalidYaml'), function(value) {
          return validateYaml(value).then(result => {
            if (!result.valid) {
              return this.createError({
                message: result.errorMessage,
              });
            }

            return result.valid;
          });
        }),
    };
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

  private _getFxVersionParts(appSettingServerUrl: string, appSettingUsername: string): FxVersionParts {
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
    // docker fxVersion with serverPath and username: DOCKER|<serverPath>/<username>/<imageName>:<tag>
    // docker fxVersion with serverPath: DOCKER|<serverPath>/<imageName>:<tag>
    // docker fxVersion without serverPath: DOCKER|<imageName>:<tag>
    // docker fxVersion without tag: DOCKER|<image>
    // image and tag each could also contain /'s
    const fxVersion = this._siteConfig.properties.linuxFxVersion || this._siteConfig.properties.windowsFxVersion;
    const fxVersionParts = fxVersion.split('|');

    if (fxVersionParts.length < 2) {
      throw Error(`Incorrect fxVersion set in the site config: ${fxVersion}`);
    }

    const isDockerCompose = this._isComposeContainerOption(fxVersion);
    if (this._isServerUrlAcr(appSettingServerUrl)) {
      return this._getAcrFxVersionParts(appSettingServerUrl, fxVersionParts[1], isDockerCompose);
    } else if (this._isServerUrlDockerHub(appSettingServerUrl)) {
      return this._getDockerHubFxVersionParts(appSettingUsername, fxVersionParts[1], isDockerCompose);
    } else {
      return this._getPrivateRegistryFxVersionParts(appSettingServerUrl, fxVersionParts[1], isDockerCompose);
    }
  }

  private _getAcrFxVersionParts(appSettingServerUrl: string, registryInfo: string, isDockerCompose: boolean): FxVersionParts {
    // NOTE(michinoy): For ACR the username is not in the FxVersion. The image and/or tags could definitely have /'s.
    // In this case, remove the serverInfo from the FxVersion and compute the image and tag by splitting on :.

    const acrHost = this._getHostFromServerUrl(appSettingServerUrl);

    if (isDockerCompose) {
      return {
        server: acrHost,
        image: '',
        tag: '',
        containerOption: ContainerOptions.compose,
        composeYml: atob(registryInfo),
      };
    } else {
      const imageAndTagInfo = registryInfo.toLocaleLowerCase().replace(`${acrHost}/`, '');
      const imageAndTagParts = imageAndTagInfo.split(':');

      return {
        server: acrHost,
        image: imageAndTagParts[0],
        tag: imageAndTagParts[1] ? imageAndTagParts[1] : 'latest',
        containerOption: ContainerOptions.docker,
        composeYml: '',
      };
    }
  }

  private _getDockerHubFxVersionParts(appSettingUsername: string, registryInfo: string, isDockerCompose: boolean): FxVersionParts {
    if (isDockerCompose) {
      return {
        server: DeploymentCenterConstants.dockerHubServerUrlHost,
        image: '',
        tag: '',
        containerOption: ContainerOptions.compose,
        composeYml: atob(registryInfo),
      };
    } else {
      // NOTE(michinoy): For DockerHub the username could be in FxVersion. This would needed in case of pulling from a private repo.
      // The image and/or tags could definitely have /'s. The username is a separate field on the form, so image and tag should not have that.
      // In this case, remove the serverInfo and/or username from the FxVersion and compute the image and tag by splitting on :.

      const serverAndUsernamePrefix = appSettingUsername
        ? `${DeploymentCenterConstants.dockerHubServerUrlHost}/${appSettingUsername}/`
        : `${DeploymentCenterConstants.dockerHubServerUrlHost}/`;

      const usernamePrefix = appSettingUsername ? `${appSettingUsername}/` : '';

      let imageAndTagInfo = registryInfo
        .toLocaleLowerCase()
        .replace(serverAndUsernamePrefix, '')
        .replace(usernamePrefix, '');

      const imageAndTagParts = imageAndTagInfo.split(':');

      return {
        server: DeploymentCenterConstants.dockerHubServerUrlHost,
        image: imageAndTagParts[0],
        tag: imageAndTagParts[1] ? imageAndTagParts[1] : 'latest',
        containerOption: ContainerOptions.docker,
        composeYml: '',
      };
    }
  }

  private _getPrivateRegistryFxVersionParts(appSettingServerUrl: string, registryInfo: string, isDockerCompose: boolean): FxVersionParts {
    // NOTE(michinoy): Unlike ACR and DockerHub, we dont actually know how a private registry text is formed.
    // Each registry would have its own convention forked from how dockerHub does things. In this case, we have
    // the serverUrl, we should remove that, but return the rest as image and tag.

    const privateRegistryHost = this._getHostFromServerUrl(appSettingServerUrl);

    if (isDockerCompose) {
      return {
        server: privateRegistryHost,
        image: '',
        tag: '',
        containerOption: ContainerOptions.compose,
        composeYml: atob(registryInfo),
      };
    } else {
      const imageAndTagInfo = registryInfo.toLocaleLowerCase().replace(`${privateRegistryHost}/`, '');
      const imageAndTagParts = imageAndTagInfo.split(':');

      return {
        server: privateRegistryHost,
        image: imageAndTagParts[0],
        tag: imageAndTagParts[1] ? imageAndTagParts[1] : 'latest',
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
      const dockerHubAccessType = username && password ? ContainerDockerAccessTypes.private : ContainerDockerAccessTypes.public;

      return {
        dockerHubImageAndTag: fxVersionParts.tag ? `${fxVersionParts.image}:${fxVersionParts.tag}` : fxVersionParts.image,
        dockerHubComposeYml: fxVersionParts.composeYml,
        dockerHubAccessType: dockerHubAccessType,
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
    return !!serverUrl && serverUrl.indexOf(DeploymentCenterConstants.dockerHubServerUrlHost) > -1;
  }

  private _isComposeContainerOption(fxVersion: string): boolean {
    const fxVersionParts = fxVersion ? fxVersion.split('|') : [];
    return fxVersionParts[0].toLocaleLowerCase() === DeploymentCenterConstants.composePrefix.toLocaleLowerCase();
  }

  private _getHostFromServerUrl(serverUrl: string): string {
    // In case of either https://xyz.com or https://xyz.com/ or https://xyz.com/a return xyz.com
    const host = serverUrl.toLocaleLowerCase().replace('https://', '');
    const hostParts = host.split('/');
    return hostParts[0];
  }

  private _validateYaml(yaml: string): Promise<YamlValidationResult> {
    return new Promise(resolve => {
      if (yaml) {
        yamlLint
          .lint(yaml)
          .then(() => {
            resolve({
              valid: true,
            });
          })
          .catch(error => {
            resolve({
              valid: false,
              errorMessage: this._t('configYamlInvalid').format(error),
            });
          });
      } else {
        resolve({
          valid: true,
        });
      }
    });
  }

  private _getContinuousDeploymentOption(): ContinuousDeploymentOption {
    const value = this._applicationSettings && this._applicationSettings.properties[DeploymentCenterConstants.enableCISetting];
    return value && value.toLocaleLowerCase() === 'true' ? ContinuousDeploymentOption.on : ContinuousDeploymentOption.off;
  }
}
