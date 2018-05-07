import { ReplaySubject } from 'rxjs/ReplaySubject';
import { FormGroup, FormControl } from '@angular/forms';
import { WizardForm, ProvisioningConfiguration, CiConfiguration, DeploymentTarget, DeploymentSourceType, CodeRepositoryDeploymentSource, ApplicationType, DeploymentTargetProvider, AzureAppServiceDeploymentTarget, AzureResourceType, TargetEnvironmentType, CodeRepository } from './deployment-center-setup-models';
import { Observable } from 'rxjs/Observable';
import { Headers } from '@angular/http';
import { CacheService } from '../../../../shared/services/cache.service';
import { ArmSiteDescriptor, ArmPlanDescriptor } from '../../../../shared/resourceDescriptors';
import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { UserService } from '../../../../shared/services/user.service';
import { Constants, ARMApiVersions } from '../../../../shared/models/constants';
import { parseToken } from '../../../../pickers/microsoft-graph/microsoft-graph-helper';
import { PortalService } from '../../../../shared/services/portal.service';
import { ArmObj } from '../../../../shared/models/arm/arm-obj';
import { Site } from '../../../../shared/models/arm/site';
import { SiteService } from '../../../../shared/services/site.service';

@Injectable()
export class DeploymentCenterStateManager implements OnDestroy {

    public resourceIdStream$ = new ReplaySubject<string>(1);
    public wizardForm: FormGroup = new FormGroup({});
    private _resourceId = '';
    private _location = '';
    private _ngUnsubscribe$ = new Subject();
    private _token: string;
    private _vstsApiToken: string;
    private _pricingTier: string;
    public siteArm: ArmObj<Site>;
    constructor(
        private _cacheService: CacheService,
        siteService: SiteService,
        userService: UserService,
        portalService: PortalService) {
        this.resourceIdStream$.switchMap(r => {
            this._resourceId = r;
            return siteService.getSite(this._resourceId);
        })
            .subscribe(s => {
                this.siteArm = s.result;
                this._location = this.siteArm.location;
                this._pricingTier = this.siteArm.properties.sku;
            });

        userService.getStartupInfo().takeUntil(this._ngUnsubscribe$).subscribe(r => {
            this._token = r.token;
        });

        portalService.getAdToken('azureTfsApi').first()
            .subscribe(tokenData => {
                this._vstsApiToken = tokenData.result.token;
            });

    }

    public get wizardValues(): WizardForm {
        return this.wizardForm.value;
    }

    public set wizardValues(values: WizardForm) {
        this.wizardForm.patchValue(values);
    }
    public get sourceSettings(): FormGroup {
        return (this.wizardForm && (this.wizardForm.controls.sourceSettings as FormGroup)) || null;
    }

    public get buildSettings(): FormGroup {
        return (this.wizardForm && (this.wizardForm.controls.buildSettings as FormGroup)) || null;
    }

    public get testEnvironmentSettings(): FormGroup {
        return (this.wizardForm && (this.wizardForm.controls.testEnvironment as FormGroup)) || null;
    }

    public get deploymentSlotSetting(): FormGroup {
        return (this.wizardForm && (this.wizardForm.controls.deploymentSlotSetting as FormGroup)) || null;
    }

    public deploy(): Observable<any> {
        switch (this.wizardValues.buildProvider) {
            case 'vsts':
                return this._deployVsts();
            default:
                return this._deployKudu();
        }
    }

    private _deployKudu() {
        const payload = this.wizardValues.sourceSettings;
        if (this.wizardValues.sourceProvider === 'external') {
            payload.isManualIntegration = true;
        }

        if (this.wizardValues.sourceProvider === 'localgit') {
            return this._cacheService.patchArm(`${this._resourceId}/config/web`, ARMApiVersions.websiteApiVersion, {
                properties: {
                    scmType: 'LocalGit'
                }
            }).map(r => r.json());
        } else {
            return this._cacheService.putArm(`${this._resourceId}/sourcecontrols/web`, ARMApiVersions.websiteApiVersion, {
                properties: payload
            }).map(r => r.json());
        }

    }

    private _deployVsts() {
        return this._startVstsDeployment().concatMap(id => {
            return Observable.timer(1000, 1000)
                .switchMap(() => this._pollVstsCheck(id))
                .map(r => {
                    const result = r.json();
                    const ciConfig: string = result.ciConfiguration.result.status;
                    return ciConfig;
                })
                .first(result => {
                    return result !== 'inProgress' && result !== 'queued';
                });
        });
    }

    private _pollVstsCheck(id: string) {
        return this._cacheService.get(`https://${this.wizardValues.buildSettings.vstsAccount}.portalext.visualstudio.com/_apis/ContinuousDelivery/ProvisioningConfigurations/${id}?api-version=3.2-preview.1`, true, this.getVstsDirectHeaders());
    }
    private _startVstsDeployment() {
        const deploymentObject: ProvisioningConfiguration = {
            authToken: this.getToken(),
            ciConfiguration: this._ciConfig,
            id: null,
            source: this._deploymentSource,
            targets: this._deploymentTargets
        };
        const setupvsoCall = this._cacheService.post(`${Constants.serviceHost}api/setupvso?accountName=${this.wizardValues.buildSettings.vstsAccount}`, true, this.getVstsPassthroughHeaders(), deploymentObject);
        if (this.wizardValues.buildSettings.createNewVsoAccount) {
            return this._cacheService.post(`https://app.vsaex.visualstudio.com/_apis/HostAcquisition/collections?collectionName=${this.wizardValues.buildSettings.vstsAccount}&preferredRegion=${this.wizardValues.buildSettings.location}&api-version=4.0-preview.1`, true, this.getVstsDirectHeaders())
                .switchMap(r => setupvsoCall)
                .switchMap(r => Observable.of(r.json().id));
        }
        return setupvsoCall.switchMap(r => {
            return Observable.of(r.json().id);
        });
    }
    private get _ciConfig(): CiConfiguration {
        return {
            project: {
                name: this.wizardValues.buildSettings.vstsProject
            }
        };
    }

    private get _deploymentSource(): CodeRepositoryDeploymentSource {
        return {
            type: DeploymentSourceType.CodeRepository,
            buildConfiguration: {
                type: this._applicationType,
                workingDirectory: this.wizardValues.buildSettings.workerDirecory
            },
            repository: this._repoInfo
        };
    }

    private get _repoInfo(): CodeRepository {
        switch (this.wizardValues.sourceProvider) {
            case 'github':
                return this._githubRepoInfo;
            case 'vsts':
                return this._vstsRepoInfo;
            case 'external':
                return this._externalRepoInfo;
            default:
                return this._localGitInfo;
        };
    }

    private get _githubRepoInfo(): CodeRepository {
        const repoId = this.wizardValues.sourceSettings.repoUrl.replace('https://github.com/', '');
        return {
            authorizationInfo: {
                scheme: 'PersonalAccessToken',
                parameters: {
                    AccessToken: `#{GithubToken}#`
                }
            },
            defaultBranch: `refs/heads/${this.wizardValues.sourceSettings.branch}`,
            type: 'GitHub',
            id: repoId
        };
    }

    private get _localGitInfo(): CodeRepository {
        return {
            type: 'LocalGit',
            id: null,
            defaultBranch: 'refs/heads/master',
            authorizationInfo: null
        };
    }

    private get _vstsRepoInfo(): CodeRepository {
        return {
            type: 'TfsGit',
            id: '',
            defaultBranch: 'refs/heads/master',
            authorizationInfo: null
        };
    }

    private get _externalRepoInfo(): CodeRepository {
        return {
            type: 'Git',
            id: this.wizardValues.sourceSettings.repoUrl,
            defaultBranch: 'master',
            authorizationInfo: {
                scheme: 'UsernamePassword',
                parameters: {
                    username: '',
                    password: ''
                }
            }
        };
    }

    private get _deploymentTargets(): DeploymentTarget[] {
        const deploymentTargets = [];
        if (this.wizardValues.testEnvironment.enabled) {
            deploymentTargets.push(this._loadTestTarget);
        }
        deploymentTargets.push(this._primaryTarget);
        return deploymentTargets;
    }

    private get _primaryTarget(): AzureAppServiceDeploymentTarget {
        const tid = parseToken(this._token).tid;
        const siteDescriptor = new ArmSiteDescriptor(this._resourceId);
        const targetObject = {
            provider: DeploymentTargetProvider.Azure,
            type: AzureResourceType.WindowsAppService,
            environmentType: TargetEnvironmentType.Production,
            friendlyName: 'Production',
            subscriptionId: siteDescriptor.subscription,
            subscriptionName: '',
            tenantId: tid,
            resourceIdentifier: siteDescriptor.site,
            location: this._location,
            resourceGroupName: siteDescriptor.resourceGroup,
            authorizationInfo: {
                scheme: 'Headers',
                parameters: {
                    Authorization: `Bearer ${this._vstsApiToken}`
                }
            },
            createOptions: null,
            slotSwapConfiguration: null
        };
        if (this.wizardValues.deploymentSlotSetting.deploymentSlotEnabled) {
            targetObject.slotSwapConfiguration = {
                slotName: this.wizardValues.deploymentSlotSetting.deploymentSlot
            };
        }
        return targetObject;
    }

    private get _loadTestTarget(): AzureAppServiceDeploymentTarget {
        const tid = parseToken(this._token).tid;
        const siteDescriptor = new ArmSiteDescriptor(this._resourceId);
        const newSiteDescriptor = new ArmSiteDescriptor(this.wizardValues.testEnvironment.webAppId);

        const appServicePlanDescriptor = new ArmPlanDescriptor(this.wizardValues.testEnvironment.appServicePlanId);
        const targetObject = {
            provider: DeploymentTargetProvider.Azure,
            type: AzureResourceType.WindowsAppService,
            environmentType: TargetEnvironmentType.Test,
            friendlyName: 'Load Test', // DO NOT CHANGE THIS, it looks like it should be localized but it shouldn't. It's needed by VSTS
            subscriptionId: siteDescriptor.subscription,
            subscriptionName: '',
            tenantId: tid,
            resourceIdentifier: siteDescriptor.site,
            location: this._location,
            resourceGroupName: newSiteDescriptor.resourceGroup,
            authorizationInfo: {
                scheme: 'Headers',
                parameters: {
                    Authorization: `Bearer ${this._vstsApiToken}`
                }
            },
            createOptions: this.wizardValues.testEnvironment.newApp ? {
                appServicePlanName: appServicePlanDescriptor.name,
                appServicePricingTier: this._pricingTier,
                baseAppServiceName: siteDescriptor.site
            } : null,
            slotSwapConfiguration: null
        };
        return targetObject;
    }

    private get _applicationType(): ApplicationType {
        switch (this.wizardValues.buildSettings.applicationFramework) {
            case 'AspNetWap':
                return ApplicationType.AspNetWap;
            case 'AspNetCore':
                return ApplicationType.AspNetCore;
            case 'Node':
                return ApplicationType.NodeJS;
            case 'PHP':
                return ApplicationType.PHP;
            case 'Python':
                return ApplicationType.Python;
            default:
                return ApplicationType.StaticWebapp;
        };
    }

    public getVstsPassthroughHeaders(): Headers {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Vstsauthorization', `Bearer ${this._vstsApiToken}`);
        return headers;
    }


    public getVstsDirectHeaders(): Headers {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', this.getToken());
        headers.append('X-VSS-ForceMsaPassThrough', 'true');
        return headers;
    }

    public getToken(): string {
        return `Bearer ${this._token}`;
    }

    ngOnDestroy(): void {
        this._ngUnsubscribe$.next();
    }

    resetSection(formGroup: FormGroup) {
        formGroup.reset();
    }

    markSectionAsTouched(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            if (control instanceof FormControl && !control.touched && !control.dirty) {
                control.markAsTouched();
                control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
            } else if (control instanceof FormGroup) {
                this.markSectionAsTouched(control);
            }
        });
    }
}

