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
    ContainerType } from './container-settings';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { SelectOption } from '../../shared/models/select-option';
import { ApplicationSettings } from '../../shared/models/arm/application-settings';
import { SiteConfig } from '../../shared/models/arm/site-config';
import { ContainerConstants } from '../../shared/models/constants';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RequiredValidator } from '../../shared/validators/requiredValidator';
import { Url } from '../../shared/Utilities/url';
import { PublishingCredentials } from '../../shared/models/publishing-credentials';

@Injectable()
export class ContainerSettingsManager {
    containers: Container[] = [];
    containerImageSourceOptions: SelectOption<ImageSourceType>[] = [];
    dockerHubAccessOptions: SelectOption<DockerHubAccessType>[] = [];
    continuousDeploymentOptions: SelectOption<ContinuousDeploymentOption>[] = [];
    webhookUrl: string;

    form: FormGroup;

    constructor(
        private _injector: Injector,
        private _ts: TranslateService,
        private _fb: FormBuilder) {
    }

    public resetSettings(containerSettingInfo: ContainerSettingsData) {
        this._resetContainers(containerSettingInfo);
        this._resetImageSourceOptions(containerSettingInfo);
        this._resetDockerHubAccessOptions(containerSettingInfo);
        this._resetContinuousDeploymentOptions(containerSettingInfo);
    }

    public initializeForCreate(os: ContainerOS) {
        this._initializeForm(os, null, null, null);
    }

    public initializeForConfig(os: ContainerOS, appSettings: ApplicationSettings, siteConfig: SiteConfig, publishingCredentials: PublishingCredentials) {
        this._initializeForm(os, appSettings, siteConfig, publishingCredentials);
    }

    public getContainerForm(form: FormGroup, containerType: ContainerType): FormGroup {
        const singleContainerForm = <FormGroup>form.controls.singleContainerForm;
        const dockerComposeForm = <FormGroup>form.controls.singleContainerForm;
        const kubernetesForm = <FormGroup>form.controls.singleContainerForm;

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

    private _resetContainers(containerSettingInfo: ContainerSettingsData) {
        this.containers = [
            new SingleContainer(this._injector, containerSettingInfo),
            new DockerComposeContainer(this._injector, containerSettingInfo),
            new KubernetesContainer(this._injector, containerSettingInfo),
        ];
    }

    private _resetImageSourceOptions(containerSettingInfo: ContainerSettingsData) {
        if (containerSettingInfo.fromMenu) {
            this.containerImageSourceOptions = [];
        } else {
            this.containerImageSourceOptions = [{
                displayLabel: this._ts.instant(PortalResources.containerQuickstart),
                value: 'quickstart',
            }];
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
        this.dockerHubAccessOptions = [{
            displayLabel: this._ts.instant(PortalResources.containerRepositoryPublic),
            value: 'public',
        }, {
            displayLabel: this._ts.instant(PortalResources.containerRepositoryPrivate),
            value: 'private',
        }];
    }

    private _resetContinuousDeploymentOptions(containerSettingInfo: ContainerSettingsData) {
        this.continuousDeploymentOptions = [{
            displayLabel: this._ts.instant(PortalResources.on),
            value: 'on',
        }, {
            displayLabel: this._ts.instant(PortalResources.off),
            value: 'off',
        }];
    }

    private _initializeForm(os: ContainerOS, appSettings: ApplicationSettings, siteConfig: SiteConfig, publishingCredentials: PublishingCredentials) {
        this.webhookUrl = this._getFormWebhookUrl(publishingCredentials);

        let fxVersion;
        if (siteConfig) {
            fxVersion = os === 'linux' ? siteConfig.linuxFxVersion : siteConfig.windowsFxVersion;
        }

        this.form = this._fb.group({
            os: [os, []],
            containerType: [this._getFormContainerType(fxVersion), []],
            continuousDeploymentOption: [this._getFormContinuousDeploymentOption(appSettings), []],
            singleContainerForm: this._getSingleContainerForm(fxVersion, appSettings, siteConfig, publishingCredentials),
            dockerComposeForm: this._getDockerComposeForm(fxVersion, appSettings, siteConfig, publishingCredentials),
            kubernetesForm: this._getKubernetesForm(fxVersion, appSettings, siteConfig, publishingCredentials),
        });
    }

    private _getFormContainerType(fxVersion: string): ContainerType {
        if (fxVersion) {
            const prefix = fxVersion.split('|')[0];

            if (prefix) {
                return prefix === ContainerConstants.kubernetesPrefix
                    ? 'kubernetes'
                    : prefix === ContainerConstants.composePrefix
                        ? 'dockerCompose'
                        : 'single';
            }
        }

        return this.containers[0].id;
    }

    private _getSingleContainerForm(fxVersion: string, appSettings: ApplicationSettings, siteConfig: SiteConfig, publishingCredentials: PublishingCredentials): FormGroup {
        return this._fb.group({
            imageSource: [this._getFormImageSource(fxVersion, appSettings), []],
            imageSourceQuickstartForm: this._getQuickstartForm(),
            imageSourceAcrForm: this._getAcrForm('single', fxVersion, appSettings, siteConfig),
            imageSourceDockerHubForm: this._getDockerHubForm('single', fxVersion, appSettings, siteConfig),
            imageSourcePrivateRegistryForm: this._getPrivateRegistryForm('single', fxVersion, appSettings, siteConfig),
        });
    }

    private _getDockerComposeForm(fxVersion: string, appSettings: ApplicationSettings, siteConfig: SiteConfig, publishingCredentials: PublishingCredentials): FormGroup {
        return this._fb.group({
            imageSource: [this._getFormImageSource(fxVersion, appSettings), []],
            imageSourceQuickstartForm: this._getQuickstartForm(),
            imageSourceAcrForm: this._getAcrForm('dockerCompose', fxVersion, appSettings, siteConfig),
            imageSourceDockerHubForm: this._getDockerHubForm('dockerCompose', fxVersion, appSettings, siteConfig),
            imageSourcePrivateRegistryForm: this._getPrivateRegistryForm('dockerCompose', fxVersion, appSettings, siteConfig),
        });
    }

    private _getKubernetesForm(fxVersion: string, appSettings: ApplicationSettings, siteConfig: SiteConfig, publishingCredentials: PublishingCredentials): FormGroup {
        return this._fb.group({
            imageSource: [this._getFormImageSource(fxVersion, appSettings), []],
            imageSourceQuickstartForm: this._getQuickstartForm(),
            imageSourceAcrForm: this._getAcrForm('kubernetes', fxVersion, appSettings, siteConfig),
            imageSourceDockerHubForm: this._getDockerHubForm('kubernetes', fxVersion, appSettings, siteConfig),
            imageSourcePrivateRegistryForm: this._getPrivateRegistryForm('kubernetes', fxVersion, appSettings, siteConfig),
        });
    }

    private _getFormContinuousDeploymentOption(appSettings: ApplicationSettings): ContinuousDeploymentOption {
        return this._getAppSettingsEnableCI(appSettings) === 'true'
            ? 'on'
            : 'off';
    }

    private _getFormWebhookUrl(publishingCredentials: PublishingCredentials) {
        return publishingCredentials ? `${publishingCredentials.scmUri}/docker/hook` : '';
    }

    private _getQuickstartForm(): FormGroup {
        return this._fb.group({
            config: ['', new RequiredValidator(this._ts)],
        });
    }

    private _getAcrForm(containerType: ContainerType, fxVersion: string, appSettings: ApplicationSettings, siteConfig: SiteConfig): FormGroup {
        if (containerType === 'single') {
            return this._fb.group({
                registry: [this._getAcrRegistry(fxVersion, appSettings, siteConfig), new RequiredValidator(this._ts)],
                repository: [this._getAcrRepository(fxVersion, appSettings, siteConfig), new RequiredValidator(this._ts)],
                tag: [this._getAcrTag(fxVersion, appSettings, siteConfig), new RequiredValidator(this._ts)],
                startupFile: [this._getSiteConfigAppCommandLine(siteConfig), []],
            });
        } else {
            return this._fb.group({
                registry: [this._getAcrRegistry(fxVersion, appSettings, siteConfig), new RequiredValidator(this._ts)],
                config: [this._getAcrConfig(fxVersion, appSettings, siteConfig), []],
            });
        }
    }

    private _getAcrRegistry(fxVersion: string, appSettings: ApplicationSettings, siteConfig: SiteConfig): string {
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

    private _getAcrRepository(fxVersion: string, appSettings: ApplicationSettings, siteConfig: SiteConfig): string {
        if (appSettings && appSettings[ContainerConstants.serverUrlSetting]) {
            let image;
            if (appSettings[ContainerConstants.imageNameSetting]) {
                image = appSettings[ContainerConstants.imageNameSetting];
            } else if (fxVersion) {
                image = fxVersion.split('|')[1];
            }

            if (image) {
                const imageWithRepo = image.split(':')[0];
                return imageWithRepo.split('/')[1];
            }
        }

        return '';
    }

    private _getAcrTag(fxVersion: string, appSettings: ApplicationSettings, siteConfig: SiteConfig): string {
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

    private _getAcrConfig(fxVersion: string, appSettings: ApplicationSettings, siteConfig: SiteConfig): string {
        return this._getConfigFromFxVersion(fxVersion);
    }

    private _getDockerHubForm(containerType: ContainerType, fxVersion: string, appSettings: ApplicationSettings, siteConfig: SiteConfig): FormGroup {
        return this._fb.group({
            accessType: [this._getDockerHubAccessType(appSettings), []],
            dockerHubPublicForm: this._getDockerHubPublicForm(containerType, fxVersion, appSettings, siteConfig),
            dockerHubPrivateForm: this._getDockerHubPrivateForm(containerType, fxVersion, appSettings, siteConfig),
        });
    }

    private _getDockerHubAccessType(appSettings: ApplicationSettings): DockerHubAccessType {
        const username = this._getAppSettingsUsername(appSettings);
        const password = this._getAppSettingsPassword(appSettings);

        return username && password
            ? 'private'
            : 'public';
    }

    private _getDockerHubPublicForm(containerType: ContainerType, fxVersion: string, appSettings: ApplicationSettings, siteConfig: SiteConfig): FormGroup {
        if (containerType === 'single') {
            return this._fb.group({
                image: [fxVersion ? fxVersion.split('|')[1] : '', new RequiredValidator(this._ts)],
            });
        } else {
            return this._fb.group({
                config: [this._getConfigFromFxVersion(fxVersion), new RequiredValidator(this._ts)],
            });
        }
    }

    private _getDockerHubPrivateForm(containerType: ContainerType, fxVersion: string, appSettings: ApplicationSettings, siteConfig: SiteConfig): FormGroup {
        if (containerType === 'single') {
            return this._fb.group({
                login: [this._getAppSettingsUsername(appSettings), new RequiredValidator(this._ts)],
                password: [this._getAppSettingsPassword(appSettings), new RequiredValidator(this._ts)],
                image: [fxVersion ? fxVersion.split('|')[1] : '', new RequiredValidator(this._ts)],
            });
        } else {
            return this._fb.group({
                login: [this._getAppSettingsUsername(appSettings), new RequiredValidator(this._ts)],
                password: [this._getAppSettingsPassword(appSettings), new RequiredValidator(this._ts)],
                config: [this._getConfigFromFxVersion(fxVersion), new RequiredValidator(this._ts)],
            });
        }
    }

    private _getPrivateRegistryForm(containerType: ContainerType, fxVersion: string, appSettings: ApplicationSettings, siteConfig: SiteConfig): FormGroup {
        if (containerType === 'single') {
            return this._fb.group({
                serverUrl: [this._getAppSettingServerUrl(appSettings), new RequiredValidator(this._ts)],
                login: [this._getAppSettingsUsername(appSettings), new RequiredValidator(this._ts)],
                password: [this._getAppSettingsPassword(appSettings), new RequiredValidator(this._ts)],
                image: [fxVersion ? fxVersion.split('|')[1] : '', new RequiredValidator(this._ts)],
                startupFile: [this._getSiteConfigAppCommandLine(siteConfig), new RequiredValidator(this._ts)],
            });
        } else {
            return this._fb.group({
                serverUrl: [this._getAppSettingServerUrl(appSettings), new RequiredValidator(this._ts)],
                login: [this._getAppSettingsUsername(appSettings), new RequiredValidator(this._ts)],
                password: [this._getAppSettingsPassword(appSettings), new RequiredValidator(this._ts)],
                config: [this._getConfigFromFxVersion(fxVersion), new RequiredValidator(this._ts)],
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

    private _getSiteConfigAppCommandLine(siteConfig: SiteConfig) {
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
}
