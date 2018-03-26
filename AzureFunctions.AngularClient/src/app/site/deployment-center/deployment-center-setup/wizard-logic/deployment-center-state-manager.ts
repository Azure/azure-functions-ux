import { ReplaySubject } from 'rxjs/ReplaySubject';
import { FormGroup } from '@angular/forms';
import { WizardForm, ProvisioningConfiguration, CiConfiguration, DeploymentTarget, DeploymentSourceType, CodeRepositoryDeploymentSource, ApplicationType, DeploymentTargetProvider, AzureAppServiceDeploymentTarget, AzureResourceType, TargetEnvironmentType } from './deployment-center-setup-models';
import { Observable } from 'rxjs/Observable';
import { ArmService } from '../../../../shared/services/arm.service';
import { Headers } from '@angular/http';
import { CacheService } from '../../../../shared/services/cache.service';
import { ArmSiteDescriptor } from '../../../../shared/resourceDescriptors';
import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { UserService } from '../../../../shared/services/user.service';
import { Constants } from '../../../../shared/models/constants';
import { parseToken } from '../../../../pickers/microsoft-graph/microsoft-graph-helper';

@Injectable()
export class DeploymentCenterStateManager implements OnDestroy {

    public resourceIdStream = new ReplaySubject<string>(1);
    public wizardForm: FormGroup = new FormGroup({});
    private _resourceId = '';
    private _location = '';
    private _ngUnsubscribe = new Subject();
    private _token: string;
    constructor(
        private _cacheService: CacheService,
        private _armService: ArmService,
        private _userService: UserService) {
        this.resourceIdStream.subscribe(r => {
            this._resourceId = r;
            this._armService.get(this._resourceId).subscribe(s => {
                this._location = s.json().location;
            });

        });
        this._userService.getStartupInfo().takeUntil(this._ngUnsubscribe).subscribe(r => {
            this._token = r.token;
        });
    }
    public get wizardValues(
    ): WizardForm {
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

    public Deploy(
    ): Observable<any> {
        switch (this.wizardValues.buildProvider) {
            case 'vsts':
                return this._deployVsts();
            case 'kudu':
                return this._deployKudu();
            default:
                return Observable.of(null);
        }
    }

    private _deployKudu() {
        const payload = this.wizardValues.sourceSettings;
        if (this.wizardValues.sourceProvider === 'external') {
            payload.isManualIntegration = true;
        }
        return this._armService.put(`${this._resourceId}/sourcecontrols/web`, {
            properties: payload
        }).map(r => r.json());
    }

    private _deployVsts() {
        const deploymentObject: ProvisioningConfiguration = {
            ciConfiguration: this._ciConfig,
            id: null,
            source: this._deploymentSource,
            targets: this._deploymentTargets
        };
        let vstsCall = new Observable();
        if (this.wizardValues.buildSettings.createNewVsoAccount) {
            vstsCall = vstsCall
                .switchMap(r => {
                    return this._cacheService.post(`https://app.vsaex.visualstudio.com/_apis/HostAcquisition/collections?collectionName=${this.wizardValues.buildSettings.vstsAccount}&preferredRegion=${this.wizardValues.buildSettings.location}S&api-version=4.0-preview.1`, true, this.getVstsHeaders(this._token));
                });
        }
        // vstsCall = vstsCall
        //     .switchMap(r => {
        return this._cacheService.post(`${Constants.serviceHost}api/sepupvso?accountName=${this.wizardValues.buildSettings.vstsAccount}`, true, this.getVstsHeaders(this._token), deploymentObject);
        //     });
        // return vstsCall;
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

    private get _repoInfo() {
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
    private get _githubRepoInfo() {
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

    private get _localGitInfo() {
        return {
            type: 'LocalGit',
            id: null,
            defaultBranch: 'refs/heads/master',
            authorizationInfo: null
        };
    }

    private get _vstsRepoInfo() {
        return {
            type: 'TfsGit',
            id: '',
            defaultBranch: 'refs/heads/master',
            authorizationInfo: null
        };
    }

    private get _externalRepoInfo() {
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
                    Authorization: `Bearer ${this._token}`
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
        const siteDescriptor = new ArmSiteDescriptor(this._resourceId);
        const targetObject = {
            provider: DeploymentTargetProvider.Azure,
            type: AzureResourceType.WindowsAppService,
            environmentType: TargetEnvironmentType.Test,
            friendlyName: 'Load Test',
            subscriptionId: siteDescriptor.subscription,
            subscriptionName: '',
            tenantId: '',
            resourceIdentifier: this.wizardValues.testEnvironment.webAppId,
            location: '',
            resourceGroupName: siteDescriptor.resourceGroup,
            authorizationInfo: {
                scheme: 'Headers',
                parameters: {
                    Authorization: `Bearer ${this._token}`
                }
            },
            createOptions: null,
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

    public getVstsHeaders(token: string): Headers {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', `Bearer ${token}`);
        headers.append('X-VSS-ForceMsaPassThrough', 'true');
        return headers;
    }

    ngOnDestroy(): void {
        this._ngUnsubscribe.next();
    }
}
