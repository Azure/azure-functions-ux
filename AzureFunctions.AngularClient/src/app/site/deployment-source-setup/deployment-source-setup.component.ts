import { Component } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/mergeMap';

import { PortalService } from '../../shared/services/portal.service';
import { ArmService } from '../../shared/services/arm.service';
import { CacheService } from '../../shared/services/cache.service';
import { Site } from '../../shared/models/arm/site';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { SiteConfig } from '../../shared/models/arm/site-config';
import { ProviderType, Provider, Organization, Repository, SourceControls } from '../deployment-source/deployment';
import { SiteDescriptor } from '../../shared/resourceDescriptors';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { DropDownElement } from '../../shared/models/drop-down-element';
import { SetupOAuthResponse } from '../deployment-source/deployment';

@Component({
    selector: 'deployment-source-setup',
    templateUrl: './deployment-source-setup.component.html',
    styleUrls: ['../deployment-source/deployment-source.component.scss'],
    inputs: ['siteInput'],
    outputs: ['configOutput']
})

export class DeploymentSourceSetupComponent {
    public configOutput = new Subject<ArmObj<SiteConfig>>();
    public providers: Provider[] = [];
    public organizations: DropDownElement<Organization>[] = [];
    public repositories: DropDownElement<Repository>[] = [];
    public branches: DropDownElement<string>[] = [];
    public isProviderLoading = false;
    public settingUp = false;

    // TODO: Need to add validation support to dropdown control
    public valid = false;

    // public ctrlGroup : FormGroup = null

    private _site: ArmObj<Site>;
    private _siteSubject: Subject<ArmObj<Site>>;

    public model: any;

    constructor(private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        private _armService: ArmService,
        private _cacheService: CacheService) {

        this._siteSubject = new Subject<ArmObj<Site>>();

        this._siteSubject
            .distinctUntilChanged()
            .subscribe(site => {

                this.organizations = [];
                this.repositories = [];
                this.branches = [];

                this.model = {
                    providerType: ProviderType.None,
                    organization: <Organization>null,
                    repository: <Repository>null,
                    branch: ''
                };

                this._site = site;
            });

        // this.organizationCtrl = new Control("", (control) => {
        //     return Validators.required(control)
        // });

        // this.repositoryCtrl = new Control("", (control) =>{
        //     return Validators.required(control)
        // });

        // this.branchCtrl = new Control("", (control) =>{
        //     return Validators.required(control)
        // });

        // this.ctrlGroup = new FormGroup({});

        this.providers = [
            {
                title: 'Visual Studio Team Services',
                subtitle: 'By Microsoft',
                imgUrl: 'images/vsts.png',
                type: ProviderType.VSO
            },
            {
                title: 'OneDrive',
                subtitle: 'By Microsoft',
                imgUrl: 'images/onedrive_100.png',
                type: ProviderType.OneDrive
            },
            {
                title: 'Local Git',
                subtitle: 'By Git',
                imgUrl: 'images/localgit_45.png',
                type: ProviderType.LocalGit
            },
            {
                title: 'GitHub',
                subtitle: 'By GitHub',
                imgUrl: 'images/GitHub_65.png',
                type: ProviderType.GitHub
            },
            {
                title: 'Bitbucket',
                subtitle: 'By Atlassian',
                imgUrl: 'images/bitbucket_45.png',
                type: ProviderType.Bitbucket
            },
            {
                title: 'Dropbox',
                subtitle: 'By Dropbox',
                imgUrl: 'images/dropbox_45.png',
                type: ProviderType.Dropbox
            },
            {
                title: 'External',
                subtitle: '',
                imgUrl: 'images/external_45.png',
                type: ProviderType.External
            }];
    }

    set siteInput(site: ArmObj<Site>) {
        if (!site) {
            return;
        }

        this._siteSubject.next(site);
    }

    onProviderSelect(providerType: ProviderType) {
        this.model.providerType = providerType;
        const descriptor = new SiteDescriptor(this._site.id);

        this.isProviderLoading = true;
        this._portalService.setupOAuth({
            ScmType: providerType,
            CallbackUrl: null,
            AuthUrl: null,
            SetupToken: null,
            SetupTokenSecret: null,
            SiteName: this._site.name,
            SubscriptionId: descriptor.subscription,
            ShellUrl: null
        })
            .subscribe((response: SetupOAuthResponse) => {
                this.isProviderLoading = false;

                response.Organizations.forEach(organization => {
                    this.organizations.push({
                        displayLabel: organization.Name,
                        value: organization
                    });

                    if (organization.IsDefault) {
                        this._setOrganization(organization);
                    }
                });
            });
    }

    onOrganizationSelect(organization: Organization) {
        this._setOrganization(organization);
    }

    onRepositorySelect(repository: Repository) {
        this._setRepository(repository);
    }

    onBranchSelect(/*branch: string*/) {

    }

    setup() {
        this._globalStateService.setBusyState();

        const body = <ArmObj<SourceControls>>{
            properties: {
                repoUrl: this.model.repository.html_url,
                branch: this.model.branch,
                isManualIntegration: false,
                deploymentRollbackEnabled: false,
                isMercurial: false
            }
        };

        this._armService.put(`${this._site.id}/sourceControls/web`, body)
            .mergeMap(() => {
                return this._cacheService.getArm(`${this._site.id}/config/web`, true);
            })
            .subscribe(r => {
                const config: ArmObj<SiteConfig> = r.json();
                this.configOutput.next(config);
                this._globalStateService.clearBusyState();
            });
    }

    private _setOrganization(organization: Organization) {
        this.model.organization = organization;
        this.repositories = [];
        this.branches = [];

        if (organization.Repositories && organization.Repositories.length > 0) {

            organization.Repositories.forEach(repo => {
                this.repositories.push({
                    displayLabel: repo.name,
                    value: repo
                });
            });

            this._setRepository(organization.Repositories[0]);
        } else {
            this.valid = false;
            this.model.repository = null;
            this.model.branch = '';
        }
    }

    private _setRepository(repository: Repository) {
        this.model.repository = repository;
        this.model.branch = repository.default_branch;

        this.branches = [{
            displayLabel: this.model.branch,
            value: this.model.branch
        }];

        this.valid = true;
    }
}
