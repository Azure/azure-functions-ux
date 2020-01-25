import { Injectable, Injector } from '@angular/core';
import {
  SingleContainer,
  KubernetesContainer,
  DockerComposeContainer,
  Container,
  ContainerSettingsData,
  ImageSourceType,
  DockerHubAccessType,
  ContinuousDeploymentOption,
  ContainerOS,
  ContainerType,
  ContainerFormData,
  ContainerSiteConfigFormData,
  ContainerAppSettingsFormData,
  ACRWebhookPayload,
  ACRRegistry,
} from './container-settings';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { SelectOption } from '../../shared/models/select-option';
import { ApplicationSettings } from '../../shared/models/arm/application-settings';
import { ContainerSiteConfig } from '../../shared/models/arm/site-config';
import { ContainerConstants, LogCategories } from '../../shared/models/constants';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Url } from '../../shared/Utilities/url';
import { PublishingCredentials } from '../../shared/models/publishing-credentials';
import { URLValidator } from '../../shared/validators/urlValidator';
import { RequiredValidator } from '../../shared/validators/requiredValidator';
import { Observable } from 'rxjs/Observable';
import { SiteService } from '../../shared/services/site.service';
import { LogService } from '../../shared/services/log.service';
import { errorIds } from '../../shared/models/error-ids';
import { ErrorEvent } from '../../shared/models/error-event';
import { ContainerACRService } from './services/container-acr.service';
import { ArmSiteDescriptor } from '../../shared/resourceDescriptors';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { HttpResult } from '../../shared/models/http-result';
import { ContainerValidationService } from './services/container-validation.service';
import { YAMLValidator } from 'app/shared/validators/yamlValidator';

@Injectable()
export class ContainerSettingsManager {
  containers: Container[] = [];
  containerImageSourceOptions: SelectOption<ImageSourceType>[] = [];
  dockerHubAccessOptions: SelectOption<DockerHubAccessType>[] = [];
  continuousDeploymentOptions: SelectOption<ContinuousDeploymentOption>[] = [];
  webhookUrl: string;

  form: FormGroup;
  requiredValidator: RequiredValidator;
  urlValidator: URLValidator;
  yamlValidator: YAMLValidator;

  // NOTE(michinoy): This is temporarily added while we gracefully deprecate kubernetes.
  private _containerSettingsData: ContainerSettingsData;

  constructor(
    private _injector: Injector,
    private _ts: TranslateService,
    private _fb: FormBuilder,
    private _siteService: SiteService,
    private _acrService: ContainerACRService,
    private _logService: LogService,
    private _containerValidationService: ContainerValidationService
  ) {
    this.requiredValidator = new RequiredValidator(this._ts);
    this.urlValidator = new URLValidator(this._ts);
    this.yamlValidator = new YAMLValidator(this._ts);
  }

  get containerFormData(): ContainerFormData {
    const form = this.form;
    const containerForm = this.getContainerForm(form, form.controls.containerType.value);

    const data: ContainerFormData = {
      containerType: form.controls.containerType.value,
      imageSource: containerForm.controls.imageSource.value,
      siteConfig: this._getSiteConfigFormData(form),
      appSettings: this._getAppSettingsFormData(form),
    };

    return data;
  }

  public resetSettings(containerSettingInfo: ContainerSettingsData) {
    this._resetContainers(containerSettingInfo);
    this._resetImageSourceOptions(containerSettingInfo);
    this._resetDockerHubAccessOptions(containerSettingInfo);
    this._resetContinuousDeploymentOptions(containerSettingInfo);
  }

  public initializeForCreate(os: ContainerOS, containerFormData: ContainerFormData) {
    if (containerFormData) {
      const siteConfig = this._getSiteConfigFromContainerFormData(os, containerFormData);
      const appSettings = this._getAppSettingsFromContainerFormData(os, containerFormData);
      this._initializeForm(os, appSettings, siteConfig, null);
    } else {
      this._initializeForm(os, null, null, null);
    }
  }

  public initializeForConfig(
    os: ContainerOS,
    appSettings: ApplicationSettings,
    siteConfig: ContainerSiteConfig,
    publishingCredentials: PublishingCredentials
  ) {
    this._initializeForm(os, appSettings, siteConfig, publishingCredentials);
  }

  public intializeForLockedMode(os: ContainerOS) {
    this._initializeForm(os, null, null, null);
  }

  public getContainerForm(form: FormGroup, containerType: ContainerType): FormGroup {
    const singleContainerForm = <FormGroup>form.controls.singleContainerForm;
    const dockerComposeForm = <FormGroup>form.controls.dockerComposeForm;
    const kubernetesForm = <FormGroup>form.controls.kubernetesForm;

    singleContainerForm.disable();
    dockerComposeForm.disable();
    kubernetesForm.disable();

    if (containerType === 'single') {
      singleContainerForm.enable();
      return singleContainerForm;
    } else if (containerType === 'dockerCompose') {
      dockerComposeForm.enable();
      return dockerComposeForm;
    } else if (containerType === 'kubernetes') {
      kubernetesForm.enable();
      return kubernetesForm;
    } else {
      throw new Error(`Invalid container type '${containerType}' provided.`);
    }
  }

  public getImageSourceForm(containerForm: FormGroup, imageSourceType: ImageSourceType): FormGroup {
    const quickStartForm = <FormGroup>containerForm.controls.imageSourceQuickstartForm;
    const acrForm = <FormGroup>containerForm.controls.imageSourceAcrForm;
    const dockerHubForm = <FormGroup>containerForm.controls.imageSourceDockerHubForm;
    const privateRegistryForm = <FormGroup>containerForm.controls.imageSourcePrivateRegistryForm;

    quickStartForm.disable();
    acrForm.disable();
    dockerHubForm.disable();
    privateRegistryForm.disable();

    if (imageSourceType === 'quickstart') {
      quickStartForm.enable();
      return quickStartForm;
    } else if (imageSourceType === 'azureContainerRegistry') {
      acrForm.enable();
      return acrForm;
    } else if (imageSourceType === 'dockerHub') {
      dockerHubForm.enable();
      return dockerHubForm;
    } else if (imageSourceType === 'privateRegistry') {
      privateRegistryForm.enable();
      return privateRegistryForm;
    } else {
      throw new Error(`Invalid image source type '${imageSourceType}' provided.`);
    }
  }

  public getDockerHubForm(imageSourceForm: FormGroup, accessType: DockerHubAccessType): FormGroup {
    const publicForm = <FormGroup>imageSourceForm.controls.dockerHubPublicForm;
    const privateForm = <FormGroup>imageSourceForm.controls.dockerHubPrivateForm;

    publicForm.disable();
    privateForm.disable();

    if (accessType === 'public') {
      publicForm.enable();
      return publicForm;
    } else if (accessType === 'private') {
      privateForm.enable();
      return privateForm;
    } else {
      throw new Error(`Invalid access type '${accessType}' provided`);
    }
  }

  public applyContainerConfig(resourceId: string, location: string, os: ContainerOS, formData: ContainerFormData): Observable<boolean> {
    return this._validateContainerImage(resourceId, location, os, formData);
  }

  public saveContainerConfig(resourceId: string, location: string, os: ContainerOS, formData: ContainerFormData): Observable<boolean> {
    return this._validateContainerImage(resourceId, location, os, formData).switchMap(r => {
      return Observable.zip(
        this._saveContainerAppSettings(resourceId, os, formData),
        this._saveContainerSiteConfig(resourceId, os, formData)
      ).switchMap(responses => {
        const [appSettingsUpdateResponse, siteConfigUpdateResponse] = responses;

        if (appSettingsUpdateResponse.isSuccessful && siteConfigUpdateResponse.isSuccessful) {
          if (formData.imageSource === 'azureContainerRegistry') {
            return this._manageAcrWebhook(resourceId, os, formData);
          } else {
            return Observable.of(true);
          }
        } else {
          return Observable.throw({
            errorId: errorIds.failedToUpdateContainerConfigData,
            resourceId: resourceId,
            message: this._ts.instant(PortalResources.failedToUpdateContainerConfigData),
          });
        }
      });
    });
  }

  private _validateContainerImage(resourceId: string, location: string, os: ContainerOS, formData: ContainerFormData): Observable<boolean> {
    const containerType = this._getFormContainerType(formData.siteConfig.fxVersion);

    if (os === 'windows' && containerType === 'single') {
      const fxVersionParts = formData.siteConfig.fxVersion.split('|');
      const imageAndTagParts = fxVersionParts[1].split(':');
      const image = imageAndTagParts[0];
      const tag = imageAndTagParts[1];

      return this._containerValidationService
        .validateContainerImage(
          resourceId,
          location,
          formData.appSettings[ContainerConstants.serverUrlSetting],
          'windows',
          image,
          tag,
          formData.appSettings[ContainerConstants.usernameSetting],
          formData.appSettings[ContainerConstants.passwordSetting]
        )
        .switchMap(r => {
          if (r && r.status === 200 && r.json()) {
            if (r.json().status !== 'Success') {
              return Observable.throw({
                message: r.json().error.message,
              });
            } else {
              return Observable.of(true);
            }
          } else {
            return Observable.throw({
              message: PortalResources.containerValidationFailed,
            });
          }
        });
    } else {
      return Observable.of(true);
    }
  }

  private _manageAcrWebhook(resourceId: string, os: ContainerOS, formData: ContainerFormData): Observable<boolean> {
    const siteDescriptor: ArmSiteDescriptor = new ArmSiteDescriptor(resourceId);

    return this._acrService
      .getRegistries(siteDescriptor.subscription)
      .switchMap(registryResources => {
        if (registryResources.isSuccessful && registryResources.result.value && registryResources.result.value.length > 0) {
          const acrRegistry = this._getAcrRegistry(formData.appSettings);
          const registry = registryResources.result.value.find(item => item.properties.loginServer === acrRegistry);

          if (this._isCIEnabled(formData)) {
            return this._updateAcrWebhook(siteDescriptor, registry, formData);
          } else {
            return this._deleteAcrWebhook(siteDescriptor, registry, formData);
          }
        } else {
          return Observable.throw({
            errorId: errorIds.failedToGetAzureContainerRegistries,
            resourceId: resourceId,
            message: this._ts.instant(PortalResources.failedToUpdateContainerConfigData),
          });
        }
      })
      .switchMap(updateResponse => {
        if (updateResponse.isSuccessful) {
          return Observable.of(true);
        } else {
          return Observable.throw({ ...updateResponse.error, resourceId });
        }
      });
  }

  private _deleteAcrWebhook(siteDescriptor: ArmSiteDescriptor, registry: ArmObj<ACRRegistry>, formData: ContainerFormData) {
    const webhookName = this._getAcrWebhookName(siteDescriptor);
    const webhookResourceId = `${registry.id}/webhooks/${webhookName}`;

    return this._acrService.deleteAcrWebhook(webhookResourceId);
  }

  private _updateAcrWebhook(siteDescriptor: ArmSiteDescriptor, registry: ArmObj<ACRRegistry>, formData: ContainerFormData) {
    const webhookName = this._getAcrWebhookName(siteDescriptor);

    // NOTE(michinoy): In a multi-container configuration there is no way to detect the repository and tag as there are multiple configurations.
    // In this case the scope should be set to an empty string
    const acrTag = formData.containerType === 'single' ? this._getAcrTag(formData.siteConfig.fxVersion, formData.appSettings) : '';
    const acrRespository =
      formData.containerType === 'single' ? this._getAcrRepository(formData.siteConfig.fxVersion, formData.appSettings) : '';

    let scope = '';
    if (acrRespository) {
      scope += acrRespository;

      if (acrTag) {
        scope += `:${acrTag}`;
      }
    }

    const payload: ACRWebhookPayload = {
      scope,
      serviceUri: this.webhookUrl,
      customHeaders: {},
      actions: ['push'],
      status: 'enabled',
    };

    const webhookResourceId = `${registry.id}/webhooks/${webhookName}`;

    return this._acrService.updateAcrWebhook(webhookResourceId, webhookName, registry.location, payload);
  }

  private _isCIEnabled(formData) {
    return formData.appSettings[ContainerConstants.enableCISetting] && formData.appSettings[ContainerConstants.enableCISetting] === 'true';
  }

  private _getAcrWebhookName(siteDescriptor: ArmSiteDescriptor) {
    // NOTE(michinoy): The name has to follow a certain pattern expected by the ACR webhook API contract
    // https://docs.microsoft.com/en-us/rest/api/containerregistry/webhooks/update
    // Requirements - only alpha numeric characters, length between 5 - 50 characters.
    const acrWebhookNameRegex = /[^a-zA-Z0-9]/g;
    const acrWebhookNameMaxLength = 50;

    let resourceName = siteDescriptor.site.replace(acrWebhookNameRegex, '');

    if (siteDescriptor.slot) {
      resourceName += siteDescriptor.slot.replace(acrWebhookNameRegex, '');
    }

    const webhookName = `webapp${resourceName}`.substring(0, acrWebhookNameMaxLength);

    return webhookName;
  }

  private _saveContainerAppSettings(resourceId: string, os: ContainerOS, formData: ContainerFormData): Observable<HttpResult<Response>> {
    return this._siteService.getAppSettings(resourceId, true).switchMap(appSettingsResponse => {
      if (appSettingsResponse.isSuccessful) {
        const appSettings = appSettingsResponse.result.properties;

        delete appSettings[ContainerConstants.serverUrlSetting];
        delete appSettings[ContainerConstants.imageNameSetting];
        delete appSettings[ContainerConstants.usernameSetting];
        delete appSettings[ContainerConstants.passwordSetting];
        delete appSettings[ContainerConstants.enableCISetting];

        const updatedAppSettings: ApplicationSettings = { ...appSettings, ...formData.appSettings };
        appSettingsResponse.result.properties = updatedAppSettings;

        return this._siteService.updateAppSettings(resourceId, appSettingsResponse.result);
      } else {
        this._logService.error(LogCategories.containerSettings, errorIds.failedToGetAppSettings, appSettingsResponse.error);

        const error: ErrorEvent = {
          errorId: errorIds.failedToGetAppSettings,
          resourceId: resourceId,
          message: this._ts.instant(PortalResources.failedToGetContainerConfigData),
        };

        return Observable.throw(error);
      }
    });
  }

  private _saveContainerSiteConfig(resourceId: string, os: ContainerOS, formData: ContainerFormData): Observable<HttpResult<Response>> {
    return this._siteService.getSiteConfig(resourceId, true).switchMap(siteConfigResponse => {
      if (siteConfigResponse.isSuccessful) {
        const siteConfig = siteConfigResponse.result;

        siteConfig.properties.linuxFxVersion = null;
        siteConfig.properties.windowsFxVersion = null;

        // The user may have VNET security restrictions enabled. If so, then including "ipSecurityRestrictions" or "scmIpSecurityRestrictions" in the payload for
        // the config/web API means that the call will require joinViaServiceEndpoint/action permissions on the given subnet(s) referenced in the security restrictions.
        // If the user doesn't have these permissions, the config/web API call will fail. (This is true even if these properties are just being round-tripped.)
        // Since this UI doesn't allow modifying these properties, we can just remove them from the config object to avoid the unnecessary permissions requirement.
        delete siteConfig.properties.ipSecurityRestrictions;
        delete siteConfig.properties.scmIpSecurityRestrictions;

        if (os === 'linux') {
          siteConfig.properties.linuxFxVersion = formData.siteConfig.fxVersion;
        } else {
          siteConfig.properties.windowsFxVersion = formData.siteConfig.fxVersion;
        }
        siteConfig.properties.appCommandLine = formData.siteConfig.appCommandLine;

        return this._siteService.updateSiteConfig(resourceId, siteConfig);
      } else {
        this._logService.error(LogCategories.containerSettings, errorIds.failedToGetSiteConfig, siteConfigResponse.error);

        const error: ErrorEvent = {
          errorId: errorIds.failedToGetSiteConfig,
          resourceId: resourceId,
          message: this._ts.instant(PortalResources.failedToGetContainerConfigData),
        };

        return Observable.throw(error);
      }
    });
  }

  private _getSiteConfigFromContainerFormData(os: ContainerOS, containerFormData: ContainerFormData): ContainerSiteConfig {
    const siteConfig: ContainerSiteConfig = {
      linuxFxVersion: null,
      windowsFxVersion: null,
      appCommandLine: containerFormData.siteConfig.appCommandLine,
    };

    if (os === 'linux') {
      siteConfig.linuxFxVersion = containerFormData.siteConfig.fxVersion;
    } else {
      siteConfig.windowsFxVersion = containerFormData.siteConfig.fxVersion;
    }

    return siteConfig;
  }

  private _getAppSettingsFromContainerFormData(os: ContainerOS, containerFormData: ContainerFormData): ApplicationSettings {
    return containerFormData.appSettings;
  }

  private _resetContainers(containerSettingInfo: ContainerSettingsData) {
    this._containerSettingsData = containerSettingInfo;
    this.containers = [
      new SingleContainer(this._injector, containerSettingInfo),
      new DockerComposeContainer(this._injector, containerSettingInfo),
    ];
  }

  private _resetImageSourceOptions(containerSettingInfo: ContainerSettingsData) {
    if (containerSettingInfo.fromMenu || containerSettingInfo.isFunctionApp) {
      this.containerImageSourceOptions = [];
    } else {
      this.containerImageSourceOptions = [
        {
          displayLabel: this._ts.instant(PortalResources.containerQuickstart),
          value: 'quickstart',
        },
      ];
    }

    this.containerImageSourceOptions.push({
      displayLabel: this._ts.instant(PortalResources.containerACR),
      value: 'azureContainerRegistry',
    });

    this.containerImageSourceOptions.push({
      displayLabel: this._ts.instant(PortalResources.containerDockerHub),
      value: 'dockerHub',
    });

    this.containerImageSourceOptions.push({
      displayLabel: this._ts.instant(PortalResources.containerPrivateRegistry),
      value: 'privateRegistry',
    });
  }

  private _resetDockerHubAccessOptions(containerSettingInfo: ContainerSettingsData) {
    this.dockerHubAccessOptions = [
      {
        displayLabel: this._ts.instant(PortalResources.containerRepositoryPublic),
        value: 'public',
      },
      {
        displayLabel: this._ts.instant(PortalResources.containerRepositoryPrivate),
        value: 'private',
      },
    ];
  }

  private _resetContinuousDeploymentOptions(containerSettingInfo: ContainerSettingsData) {
    this.continuousDeploymentOptions = [
      {
        displayLabel: this._ts.instant(PortalResources.on),
        value: 'on',
      },
      {
        displayLabel: this._ts.instant(PortalResources.off),
        value: 'off',
      },
    ];
  }

  private _initializeForm(
    os: ContainerOS,
    appSettings: ApplicationSettings,
    siteConfig: ContainerSiteConfig,
    publishingCredentials: PublishingCredentials
  ) {
    // NOTE(michinoy): Only add the Kubernetes tab for container configuration if it is already set
    // else do not show. This is a graceful way of deprecating the kubernetes support.
    if (siteConfig && siteConfig.linuxFxVersion && this._getFormContainerType(siteConfig.linuxFxVersion) === 'kubernetes') {
      this.containers.push(new KubernetesContainer(this._injector, this._containerSettingsData));
    }

    this.webhookUrl = this._getFormWebhookUrl(publishingCredentials);

    let fxVersion;
    if (siteConfig) {
      fxVersion = os === 'linux' ? siteConfig.linuxFxVersion : siteConfig.windowsFxVersion;
    }

    const selectedContainerType = this._getFormContainerType(fxVersion);

    const singleContainerForm =
      selectedContainerType === 'single'
        ? this._getSingleContainerForm(fxVersion, appSettings, siteConfig)
        : this._getSingleContainerForm(null, null, null);

    const dockerComposeForm =
      selectedContainerType === 'dockerCompose'
        ? this._getDockerComposeForm(fxVersion, appSettings, siteConfig)
        : this._getDockerComposeForm(null, null, null);

    const kubernetesForm =
      selectedContainerType === 'kubernetes'
        ? this._getKubernetesForm(fxVersion, appSettings, siteConfig)
        : this._getKubernetesForm(null, null, null);

    this.form = this._fb.group({
      os: [os, this.requiredValidator.validate.bind(this.requiredValidator)],
      containerType: [selectedContainerType, this.requiredValidator.validate.bind(this.requiredValidator)],
      continuousDeploymentOption: [
        this._getFormContinuousDeploymentOption(appSettings),
        this.requiredValidator.validate.bind(this.requiredValidator),
      ],
      singleContainerForm: singleContainerForm,
      dockerComposeForm: dockerComposeForm,
      kubernetesForm: kubernetesForm,
    });
  }

  private _getFormContainerType(fxVersion: string): ContainerType {
    if (fxVersion) {
      const prefix = fxVersion.split('|')[0];

      if (prefix && prefix === ContainerConstants.kubernetesPrefix) {
        return 'kubernetes';
      } else if (prefix && prefix === ContainerConstants.composePrefix) {
        return 'dockerCompose';
      }
    }

    return 'single';
  }

  private _getSingleContainerForm(fxVersion: string, appSettings: ApplicationSettings, siteConfig: ContainerSiteConfig): FormGroup {
    return this._getImageSourceForm('single', fxVersion, appSettings, siteConfig);
  }

  private _getDockerComposeForm(fxVersion: string, appSettings: ApplicationSettings, siteConfig: ContainerSiteConfig): FormGroup {
    return this._getImageSourceForm('dockerCompose', fxVersion, appSettings, siteConfig);
  }

  private _getKubernetesForm(fxVersion: string, appSettings: ApplicationSettings, siteConfig: ContainerSiteConfig): FormGroup {
    return this._getImageSourceForm('kubernetes', fxVersion, appSettings, siteConfig);
  }

  private _getImageSourceForm(
    containerFormType: ContainerType,
    fxVersion: string,
    appSettings: ApplicationSettings,
    siteConfig: ContainerSiteConfig
  ): FormGroup {
    const selectedContainerType = this._getFormContainerType(fxVersion);
    const selectedImageSourceType = this._getFormImageSource(fxVersion, appSettings);

    const acrForm =
      selectedContainerType === containerFormType && selectedImageSourceType === 'azureContainerRegistry'
        ? this._getAcrForm(containerFormType, fxVersion, appSettings, siteConfig)
        : this._getAcrForm(containerFormType, null, null, null);

    const dockerHubForm =
      selectedContainerType === containerFormType && selectedImageSourceType === 'dockerHub'
        ? this._getDockerHubForm(containerFormType, fxVersion, appSettings, siteConfig)
        : this._getDockerHubForm(containerFormType, null, null, null);

    const privateRegistryForm =
      selectedContainerType === containerFormType && selectedImageSourceType === 'privateRegistry'
        ? this._getPrivateRegistryForm(containerFormType, fxVersion, appSettings, siteConfig)
        : this._getPrivateRegistryForm(containerFormType, null, null, null);

    return this._fb.group({
      imageSource: [selectedImageSourceType, this.requiredValidator.validate.bind(this.requiredValidator)],
      imageSourceQuickstartForm: this._getQuickstartForm(),
      imageSourceAcrForm: acrForm,
      imageSourceDockerHubForm: dockerHubForm,
      imageSourcePrivateRegistryForm: privateRegistryForm,
    });
  }

  private _getFormContinuousDeploymentOption(appSettings: ApplicationSettings): ContinuousDeploymentOption {
    return this._getAppSettingsEnableCI(appSettings) === 'true' ? 'on' : 'off';
  }

  private _getFormWebhookUrl(publishingCredentials: PublishingCredentials) {
    return publishingCredentials ? `${publishingCredentials.scmUri}/docker/hook` : '';
  }

  private _getQuickstartForm(): FormGroup {
    return this._fb.group({
      serverUrl: [''],
      config: ['', this.requiredValidator.validate.bind(this.requiredValidator)],
    });
  }

  private _getAcrForm(
    containerType: ContainerType,
    fxVersion: string,
    appSettings: ApplicationSettings,
    siteConfig: ContainerSiteConfig
  ): FormGroup {
    if (containerType === 'single') {
      return this._fb.group({
        registry: [this._getAcrRegistry(appSettings), this.requiredValidator.validate.bind(this.requiredValidator)],
        login: [this._getAppSettingsUsername(appSettings), this.requiredValidator.validate.bind(this.requiredValidator)],
        password: [this._getAppSettingsPassword(appSettings), this.requiredValidator.validate.bind(this.requiredValidator)],
        repository: [this._getAcrRepository(fxVersion, appSettings), this.requiredValidator.validate.bind(this.requiredValidator)],
        tag: [this._getAcrTag(fxVersion, appSettings), this.requiredValidator.validate.bind(this.requiredValidator)],
        startupFile: [this._getSiteConfigAppCommandLine(siteConfig)],
      });
    } else {
      return this._fb.group({
        registry: [this._getAcrRegistry(appSettings), this.requiredValidator.validate.bind(this.requiredValidator)],
        login: [this._getAppSettingsUsername(appSettings), this.requiredValidator.validate.bind(this.requiredValidator)],
        password: [this._getAppSettingsPassword(appSettings), this.requiredValidator.validate.bind(this.requiredValidator)],
        config: [
          this._getAcrConfig(fxVersion, appSettings, siteConfig),
          this.requiredValidator.validate.bind(this.requiredValidator),
          this.yamlValidator.validate.bind(this.yamlValidator),
        ],
      });
    }
  }

  private _getAcrRegistry(appSettings: ApplicationSettings): string {
    if (appSettings && appSettings[ContainerConstants.serverUrlSetting]) {
      const serverUrl = appSettings[ContainerConstants.serverUrlSetting];
      const host = Url.getHostName(serverUrl).toLowerCase();
      const domain = host.split('.')[1];

      if (domain === ContainerConstants.acrUriBody) {
        return host;
      }
    }

    return '';
  }

  private _getAcrRepository(fxVersion: string, appSettings: ApplicationSettings): string {
    if (appSettings && appSettings[ContainerConstants.serverUrlSetting]) {
      let image;
      if (appSettings[ContainerConstants.imageNameSetting]) {
        image = appSettings[ContainerConstants.imageNameSetting];
      } else if (fxVersion) {
        image = fxVersion.split('|')[1];
      }

      if (image) {
        const imageWithRepo = image.split(':')[0];
        const imageOnlyParts = imageWithRepo.split('/');

        if (imageOnlyParts.length > 1) {
          imageOnlyParts.shift();
        }

        return imageOnlyParts.join('/');
      }
    }

    return '';
  }

  private _getAcrTag(fxVersion: string, appSettings: ApplicationSettings): string {
    if (appSettings && appSettings[ContainerConstants.serverUrlSetting]) {
      let image;
      if (appSettings[ContainerConstants.imageNameSetting]) {
        image = appSettings[ContainerConstants.imageNameSetting];
      } else if (fxVersion) {
        image = fxVersion.split('|')[1];
      }

      if (image) {
        return image.split(':')[1];
      }
    }

    return '';
  }

  private _getAcrConfig(fxVersion: string, appSettings: ApplicationSettings, siteConfig: ContainerSiteConfig): string {
    return this._getConfigFromFxVersion(fxVersion);
  }

  private _getDockerHubForm(
    containerType: ContainerType,
    fxVersion: string,
    appSettings: ApplicationSettings,
    siteConfig: ContainerSiteConfig
  ): FormGroup {
    return this._fb.group({
      accessType: [this._getDockerHubAccessType(appSettings)],
      dockerHubPublicForm: this._getDockerHubPublicForm(containerType, fxVersion, appSettings, siteConfig),
      dockerHubPrivateForm: this._getDockerHubPrivateForm(containerType, fxVersion, appSettings, siteConfig),
    });
  }

  private _getDockerHubAccessType(appSettings: ApplicationSettings): DockerHubAccessType {
    const username = this._getAppSettingsUsername(appSettings);
    const password = this._getAppSettingsPassword(appSettings);

    return username && password ? 'private' : 'public';
  }

  private _getDockerHubPublicForm(
    containerType: ContainerType,
    fxVersion: string,
    appSettings: ApplicationSettings,
    siteConfig: ContainerSiteConfig
  ): FormGroup {
    if (containerType === 'single') {
      return this._fb.group({
        serverUrl: [ContainerConstants.dockerHubUrl],
        image: [fxVersion ? fxVersion.split('|')[1] : '', this.requiredValidator.validate.bind(this.requiredValidator)],
        startupFile: [this._getSiteConfigAppCommandLine(siteConfig)],
      });
    } else {
      return this._fb.group({
        serverUrl: [ContainerConstants.dockerHubUrl],
        config: [
          this._getConfigFromFxVersion(fxVersion),
          this.requiredValidator.validate.bind(this.requiredValidator),
          this.yamlValidator.validate.bind(this.yamlValidator),
        ],
      });
    }
  }

  private _getDockerHubPrivateForm(
    containerType: ContainerType,
    fxVersion: string,
    appSettings: ApplicationSettings,
    siteConfig: ContainerSiteConfig
  ): FormGroup {
    if (containerType === 'single') {
      return this._fb.group({
        serverUrl: [ContainerConstants.dockerHubUrl],
        login: [this._getAppSettingsUsername(appSettings), this.requiredValidator.validate.bind(this.requiredValidator)],
        password: [this._getAppSettingsPassword(appSettings), this.requiredValidator.validate.bind(this.requiredValidator)],
        image: [fxVersion ? fxVersion.split('|')[1] : '', this.requiredValidator.validate.bind(this.requiredValidator)],
        startupFile: [this._getSiteConfigAppCommandLine(siteConfig)],
      });
    } else {
      return this._fb.group({
        serverUrl: [ContainerConstants.dockerHubUrl],
        login: [this._getAppSettingsUsername(appSettings), this.requiredValidator.validate.bind(this.requiredValidator)],
        password: [this._getAppSettingsPassword(appSettings), this.requiredValidator.validate.bind(this.requiredValidator)],
        config: [
          this._getConfigFromFxVersion(fxVersion),
          this.requiredValidator.validate.bind(this.requiredValidator),
          this.yamlValidator.validate.bind(this.yamlValidator),
        ],
      });
    }
  }

  private _getPrivateRegistryForm(
    containerType: ContainerType,
    fxVersion: string,
    appSettings: ApplicationSettings,
    siteConfig: ContainerSiteConfig
  ): FormGroup {
    if (containerType === 'single') {
      return this._fb.group({
        serverUrl: [
          this._getAppSettingServerUrl(appSettings),
          [this.requiredValidator.validate.bind(this.requiredValidator), this.urlValidator.validate.bind(this.urlValidator)],
        ],
        login: [this._getAppSettingsUsername(appSettings)],
        password: [this._getAppSettingsPassword(appSettings)],
        image: [fxVersion ? fxVersion.split('|')[1] : '', this.requiredValidator.validate.bind(this.requiredValidator)],
        startupFile: [this._getSiteConfigAppCommandLine(siteConfig)],
      });
    } else {
      return this._fb.group({
        serverUrl: [
          this._getAppSettingServerUrl(appSettings),
          [this.requiredValidator.validate.bind(this.requiredValidator), this.urlValidator.validate.bind(this.urlValidator)],
        ],
        login: [this._getAppSettingsUsername(appSettings)],
        password: [this._getAppSettingsPassword(appSettings)],
        config: [
          this._getConfigFromFxVersion(fxVersion),
          this.requiredValidator.validate.bind(this.requiredValidator),
          this.yamlValidator.validate.bind(this.yamlValidator),
        ],
      });
    }
  }

  private _getFormImageSource(fxVersion: string, appSettings: ApplicationSettings): ImageSourceType {
    if (fxVersion || appSettings) {
      const serverUrl = this._getAppSettingServerUrl(appSettings);
      if (serverUrl) {
        const host = Url.getHostName(serverUrl).toLowerCase();
        const dockerHost = Url.getHostName(ContainerConstants.dockerHubUrl).toLowerCase();

        if (host === dockerHost) {
          return 'dockerHub';
        } else if (host.split('.')[1] === ContainerConstants.acrUriBody) {
          return 'azureContainerRegistry';
        }
      } else if (fxVersion && fxVersion.split('|')[1]) {
        return 'dockerHub';
      }

      return 'privateRegistry';
    } else {
      return this.containerImageSourceOptions[0].value;
    }
  }

  private _getAppSettingServerUrl(appSettings: ApplicationSettings) {
    return appSettings && appSettings[ContainerConstants.serverUrlSetting] ? appSettings[ContainerConstants.serverUrlSetting] : '';
  }

  private _getAppSettingsUsername(appSettings: ApplicationSettings) {
    return appSettings && appSettings[ContainerConstants.usernameSetting] ? appSettings[ContainerConstants.usernameSetting] : '';
  }

  private _getAppSettingsPassword(appSettings: ApplicationSettings) {
    return appSettings && appSettings[ContainerConstants.passwordSetting] ? appSettings[ContainerConstants.passwordSetting] : '';
  }

  private _getAppSettingsEnableCI(appSettings: ApplicationSettings) {
    return appSettings && appSettings[ContainerConstants.enableCISetting] ? appSettings[ContainerConstants.enableCISetting] : '';
  }

  private _getSiteConfigAppCommandLine(siteConfig: ContainerSiteConfig) {
    return siteConfig && siteConfig.appCommandLine ? siteConfig.appCommandLine : '';
  }

  private _getConfigFromFxVersion(fxVersion: string) {
    // NOTE(michinoy): The manner in which the form gets populated, it is not possible
    // to determine whether the config stored in the fxversion is encoded or not. Thus
    // try to decode, if it fails, than return the config string.
    if (fxVersion) {
      const configString = fxVersion.split('|')[1];
      if (configString) {
        try {
          const config = atob(configString);
          return config;
        } catch (ex) {
          return configString;
        }
      }
    }

    return '';
  }

  private _getSiteConfigFormData(form: FormGroup): ContainerSiteConfigFormData {
    const containerType = form.controls.containerType.value;
    const containerForm = this.getContainerForm(form, containerType);

    return {
      fxVersion: this._getFxVersionFormData(containerType, containerForm),
      appCommandLine: this._getAppCommandLineFormData(containerType, containerForm),
    };
  }

  private _getFxVersionFormData(containerType: ContainerType, containerForm: FormGroup): string {
    let prefix: string;

    if (containerType === 'single') {
      prefix = ContainerConstants.dockerPrefix;
    } else if (containerType === 'dockerCompose') {
      prefix = ContainerConstants.composePrefix;
    } else {
      prefix = ContainerConstants.kubernetesPrefix;
    }

    const imageSourceType: ImageSourceType = containerForm.controls.imageSource.value;

    let imageSourceForm = this.getImageSourceForm(containerForm, imageSourceType);
    if (imageSourceType === 'dockerHub') {
      const accessType: DockerHubAccessType = imageSourceForm.controls.accessType.value;
      imageSourceForm = this.getDockerHubForm(imageSourceForm, accessType);
    }

    const fxVersion =
      containerType === 'single'
        ? this._getSingleContaierFxVersion(prefix, imageSourceType, imageSourceForm)
        : this._getMultiContainerFxVersion(prefix, imageSourceType, imageSourceForm);

    return fxVersion;
  }

  private _getSingleContaierFxVersion(prefix: string, imageSourceType: ImageSourceType, imageSourceForm: FormGroup) {
    if (imageSourceType === 'quickstart') {
      return `${prefix}|${imageSourceForm.controls.config.value}`;
    } else if (imageSourceType === 'azureContainerRegistry') {
      const registry = imageSourceForm.controls.registry.value;
      const repository = imageSourceForm.controls.repository.value;
      const tag = imageSourceForm.controls.tag.value;
      return `${prefix}|${registry}/${repository}:${tag}`;
    } else if (imageSourceType === 'dockerHub' || imageSourceType === 'privateRegistry') {
      return `${prefix}|${imageSourceForm.controls.image.value}`;
    } else {
      throw new Error('Unable to form FxVersion.');
    }
  }

  private _getMultiContainerFxVersion(prefix: string, imageSourceType: ImageSourceType, imageSourceForm: FormGroup) {
    return `${prefix}|${btoa(imageSourceForm.controls.config.value)}`;
  }

  private _getAppCommandLineFormData(containerType: ContainerType, containerForm: FormGroup): string {
    const imageSourceType: ImageSourceType = containerForm.controls.imageSource.value;
    if (containerType === 'single') {
      const imageSourceForm = this.getImageSourceForm(containerForm, imageSourceType);

      if (imageSourceType === 'dockerHub') {
        const accessType: DockerHubAccessType = imageSourceForm.controls.accessType.value;
        const dockerHubForm = this.getDockerHubForm(imageSourceForm, accessType);
        return dockerHubForm.controls.startupFile.value;
      } else if (imageSourceType !== 'quickstart') {
        return imageSourceForm.controls.startupFile.value;
      }
    }

    return '';
  }

  private _getAppSettingsFormData(form: FormGroup): ContainerAppSettingsFormData {
    const containerType = form.controls.containerType.value;
    const containerForm = this.getContainerForm(form, containerType);
    const imageSourceType: ImageSourceType = containerForm.controls.imageSource.value;

    let imageSourceForm = this.getImageSourceForm(containerForm, imageSourceType);
    if (imageSourceType === 'dockerHub') {
      const accessType: DockerHubAccessType = imageSourceForm.controls.accessType.value;
      imageSourceForm = this.getDockerHubForm(imageSourceForm, accessType);
    }

    const appSettings: ContainerAppSettingsFormData = {};

    if (form.controls.continuousDeploymentOption.value === 'on') {
      appSettings[ContainerConstants.enableCISetting] = 'true';
    }

    if (imageSourceForm.controls.login && imageSourceForm.controls.login.value) {
      appSettings[ContainerConstants.usernameSetting] = imageSourceForm.controls.login.value;
    }

    if (imageSourceForm.controls.password && imageSourceForm.controls.password.value) {
      appSettings[ContainerConstants.passwordSetting] = imageSourceForm.controls.password.value;
    }

    appSettings[ContainerConstants.serverUrlSetting] =
      imageSourceType === 'azureContainerRegistry'
        ? `https://${imageSourceForm.controls.registry.value}`
        : imageSourceForm.controls.serverUrl.value;

    return appSettings;
  }
}
