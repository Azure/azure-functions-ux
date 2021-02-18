import { ResourceId } from '../../shared/models/arm/arm-obj';
import { ContainerSettingsComponent } from './container-settings.component';
import { TranslateService } from '@ngx-translate/core';
import { Injector } from '@angular/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { FormGroup } from '@angular/forms';
import { ErrorEvent } from '../../shared/models/error-event';

export type ImageSourceType = 'quickstart' | 'azureContainerRegistry' | 'dockerHub' | 'privateRegistry';

export type DockerHubAccessType = 'public' | 'private';

export type ContainerType = 'single' | 'dockerCompose' | 'kubernetes';

export type ContainerOS = 'linux' | 'windows';

export type ContinuousDeploymentOption = 'on' | 'off';

export interface ContainerSettingsInput<T> {
  id: ResourceId;
  data?: T;
  containerSettings: ContainerSettingsComponent;
}

export interface ContainerSettingsData {
  resourceId: string;
  isFunctionApp: boolean;
  subscriptionId: string;
  location: string;
  os: ContainerOS;
  fromMenu: boolean;
  containerFormData: ContainerFormData;
}

export interface ContainerConfigureData extends ContainerSettingsData {
  container: Container;
  form: FormGroup;
  containerForm: FormGroup;
}

export interface ContainerImageSourceData extends ContainerConfigureData {
  imageSourceForm: FormGroup;
}

export interface ContainerFormData {
  containerType: ContainerType;
  imageSource: ImageSourceType;
  siteConfig: ContainerSiteConfigFormData;
  appSettings: ContainerAppSettingsFormData;
}

export interface ContainerSiteConfigFormData {
  fxVersion: string;
  appCommandLine: string;
}

export interface ContainerAppSettingsFormData {
  [key: string]: string;
}

export abstract class Container {
  abstract iconUrl: string;
  abstract title: string;
  abstract id: ContainerType;
  abstract description: string;
  abstract disableMessage: string;

  protected ts: TranslateService;

  constructor(injector: Injector) {
    this.ts = injector.get(TranslateService);
  }
}

export class SingleContainer extends Container {
  iconUrl = 'image/singlecontainer.svg';
  title = this.ts.instant(PortalResources.singleContainerTitle);
  id: ContainerType = 'single';
  description = '';
  disableMessage = '';

  constructor(injector: Injector, containerSettingsData: ContainerSettingsData) {
    super(injector);
  }
}

export class DockerComposeContainer extends Container {
  iconUrl = 'image/dockercompose.svg';
  title = this.ts.instant(PortalResources.dockerComposeContainerTitle);
  id: ContainerType = 'dockerCompose';
  description = '';
  disableMessage = '';

  constructor(injector: Injector, containerSettingsData: ContainerSettingsData) {
    super(injector);

    if (containerSettingsData.os === 'windows') {
      this.disableMessage = this.ts.instant(PortalResources.windowsDockerComposeDisableMessage);
    } else if (containerSettingsData.isFunctionApp) {
      this.disableMessage = this.ts.instant(PortalResources.functionsDockerComposeDisableMessage);
    }
  }
}

export class KubernetesContainer extends Container {
  iconUrl = 'image/kubernetes.svg';
  title = this.ts.instant(PortalResources.kubernetesContainerTitle);
  id: ContainerType = 'kubernetes';
  description = '';
  disableMessage = '';

  constructor(injector: Injector, containerSettingsData: ContainerSettingsData) {
    super(injector);

    if (containerSettingsData.os === 'windows') {
      this.disableMessage = this.ts.instant(PortalResources.windowsKubernetesDisableMessage);
    } else if (containerSettingsData.isFunctionApp) {
      this.disableMessage = this.ts.instant(PortalResources.functionsKubernetesDisableMessage);
    }
  }
}

export interface ImageSourceOption {
  displayText: string;
  value: ImageSourceType;
  hide: boolean;
}

export interface DockerHubRepositoryAccessOption {
  displayText: string;
  value: DockerHubAccessType;
}

export interface ContainerSample {
  name: string;
  title: string;
  configBase64Encoded: string;
  description: string;
  containerType: ContainerType;
  containerOS: ContainerOS;
  sourceUrl: string;
  learnMoreLink: string;
}

export interface ACRRegistry {
  resourceId: string;
  loginServer: string;
  creationDate: string;
  provisioningState: string;
  adminUserEnabled: boolean;
  storageAccount: ACRRegistryStorage;
}

export interface ACRRegistryStorage {
  name: string;
}

export interface ACRCredential {
  username: string;
  passwords: ACRCredentialPassword[];
}

export interface ACRCredentialPassword {
  name: string;
  value: string;
}

export interface ACRDirectRequestPayload {
  subId: string;
  endpoint: string;
  username: string;
  password: string;
}

export interface ACRRepositories {
  repositories: string[];
}

export interface ACRTags {
  name: string;
  tags: string[];
}

export interface ContainerConfigSaveStatus {
  success: boolean;
  error: ErrorEvent;
}

export interface ACRWebhookPayload {
  serviceUri: string;
  customHeaders: { [key: string]: string };
  actions: string[];
  status: 'enabled' | 'disabled';
  scope: string;
}

export interface ProxyRequest<T> {
  body: T;
  headers: { [name: string]: string };
  method: string;
  url: string;
}

export interface GetRepositoryTagRequest {
  baseUrl: string;
  platform: string;
  repository: string;
  tag: string;
  username: string;
  password: string;
}
