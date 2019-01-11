import { Component, OnDestroy } from '@angular/core';
import { SelectOption } from '../../../../../shared/models/select-option';
import { DeploymentCenterStateManager } from '../../wizard-logic/deployment-center-state-manager';
import { Subject } from 'rxjs/Subject';
import { CacheService } from '../../../../../shared/services/cache.service';
import { Observable } from 'rxjs/Observable';
import { VSOAccount, VsoProject } from '../../../Models/vso-repo';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { DropDownElement } from '../../../../../shared/models/drop-down-element';
import { LogService } from '../../../../../shared/services/log.service';
import { LogCategories, DeploymentCenterConstants } from '../../../../../shared/models/constants';
import { TranslateService } from '@ngx-translate/core';
import { RequiredValidator } from '../../../../../shared/validators/requiredValidator';
import { PortalResources } from '../../../../../shared/models/portal-resources';
import { VstsValidators } from '../../validators/vsts-validators';
import { parseToken } from 'app/pickers/microsoft-graph/microsoft-graph-helper';

@Component({
  selector: 'app-configure-vsts-build',
  templateUrl: './configure-vsts-build.component.html',
  styleUrls: ['./configure-vsts-build.component.scss', '../step-configure.component.scss', '../../deployment-center-setup.component.scss'],
})
export class ConfigureVstsBuildComponent implements OnDestroy {
  public newVsoAccountOptions: SelectOption<boolean>[];
  private _ngUnsubscribe$ = new Subject();

  public vstsRegionList = [];
  public accountList: DropDownElement<string>[];
  public projectList: DropDownElement<string>[];
  public locationList: DropDownElement<string>[];
  public accountListLoading = false;

  private vsoAccountToProjectMap: { [key: string]: DropDownElement<string>[] } = {};

  selectedAccount = '';
  selectedProject = '';
  selectedLocation = '';

  constructor(
    private _translateService: TranslateService,
    private _cacheService: CacheService,
    public wizard: DeploymentCenterStateManager,
    private _logService: LogService
  ) {
    this.newVsoAccountOptions = [
      { displayLabel: this._translateService.instant(PortalResources.new), value: true },
      { displayLabel: this._translateService.instant(PortalResources.existing), value: false },
    ];

    this.setupSubscriptions();
    const val = this.wizard.wizardValues;
    val.buildSettings.createNewVsoAccount = false;
    this.wizard.wizardValues = val;
    this.setUpformValidators();
  }

  private setUpformValidators() {
    const required = new RequiredValidator(this._translateService, false);

    if (this.wizard.wizardValues.buildSettings.createNewVsoAccount) {
      this.wizard.buildSettings.get('location').setValidators(required.validate.bind(required));
      this.wizard.buildSettings.get('vstsAccount').setValidators([required.validate.bind(required)]);
      this.wizard.buildSettings
        .get('vstsAccount')
        .setAsyncValidators([
          VstsValidators.createVstsAccountNameValidator(this.wizard, this._translateService, this._cacheService).bind(this),
        ]);
      this.wizard.buildSettings.get('vstsProject').setValidators([]);
      this.wizard.buildSettings.setAsyncValidators([]);
    } else {
      this.wizard.buildSettings.get('location').setValidators([]);
      this.wizard.buildSettings.get('vstsAccount').setValidators(required.validate.bind(required));
      this.wizard.buildSettings.get('vstsAccount').setAsyncValidators([]);
      this.wizard.buildSettings.get('vstsProject').setValidators(required.validate.bind(required));
      this.wizard.buildSettings
        .get('vstsProject')
        .setAsyncValidators(
          VstsValidators.createProjectPermissionsValidator(
            this.wizard,
            this._translateService,
            this._cacheService,
            this.wizard.buildSettings.get('vstsAccount')
          ).bind(this)
        );
    }
    this.wizard.buildSettings.get('vstsAccount').updateValueAndValidity();
    this.wizard.buildSettings.get('vstsProject').updateValueAndValidity();
    this.wizard.buildSettings.get('location').updateValueAndValidity();
  }

  private removeFormValidators() {
    this.wizard.buildSettings.get('createNewVsoAccount').setValidators([]);
    this.wizard.buildSettings.get('vstsAccount').setValidators([]);
    this.wizard.buildSettings.get('vstsAccount').setAsyncValidators([]);
    this.wizard.buildSettings.get('vstsProject').setValidators([]);
    this.wizard.buildSettings.get('location').setValidators([]);
    this.wizard.buildSettings.get('createNewVsoAccount').updateValueAndValidity();
    this.wizard.buildSettings.get('vstsAccount').updateValueAndValidity();
    this.wizard.buildSettings.get('vstsProject').updateValueAndValidity();
    this.wizard.buildSettings.get('location').updateValueAndValidity();
    if (this.wizard.wizardValues.buildProvider !== 'vsts') {
      this.wizard.buildSettings.get('vstsProject').setValidators([]);
      this.wizard.buildSettings.updateValueAndValidity();
    }
  }

  private setupSubscriptions() {
    this.accountListLoading = true;
    this.wizard
      .fetchVSTSProfile()
      .map(r => r.json())
      .switchMap(r => this.fetchAccounts(r.id))
      .do(() => (this.accountListLoading = false))
      .switchMap(r => {
        this.accountList = r.map(account => {
          return {
            displayLabel: account.accountName,
            value: account.accountName,
          };
        });
        const projectCalls: Observable<{ account: string; projects: VsoProject[] }>[] = [];
        r.forEach(account => {
          projectCalls.push(
            this._cacheService
              .get(DeploymentCenterConstants.vstsProjectsApi.format(account.accountName), true, this.wizard.getVstsDirectHeaders())
              .map(res => {
                return {
                  account: account.accountName,
                  projects: res.json().value,
                };
              })
          );
        });
        return forkJoin(projectCalls);
      })
      .subscribe(
        r => {
          this.vsoAccountToProjectMap = {};
          r.forEach(projectList => {
            this.vsoAccountToProjectMap[projectList.account] = projectList.projects.map(project => {
              return {
                displayLabel: project.name,
                value: project.name,
              };
            });
          });
        },
        err => {
          this.accountListLoading = false;
          this._logService.error(LogCategories.cicd, '/fetch-vso-profile-repo-data', err);
        }
      );

    this._cacheService.get(DeploymentCenterConstants.vstsRegionsApi, true, this.wizard.getVstsDirectHeaders()).subscribe(
      r => {
        const locationArray: any[] = r.json().value;
        this.locationList = locationArray.map(v => {
          return {
            displayLabel: v.displayName,
            value: v.regionCode,
          };
        });
      },
      err => {
        this._logService.error(LogCategories.cicd, '/fetch-vso-available-locations', err);
      }
    );
  }

  private fetchAccounts(memberId: string): Observable<VSOAccount[]> {
    const accountsUrl = DeploymentCenterConstants.vstsAccountsFetchUri.format(memberId);
    return this._cacheService.get(accountsUrl, true, this.wizard.getVstsDirectHeaders()).switchMap(r => {
      const accounts = r.json().value as VSOAccount[];
      this.wizard.vsoAccounts = accounts;
      return Observable.of(
        accounts.filter(
          x =>
            x.isAccountOwner &&
            (x.accountTenantId === DeploymentCenterConstants.EmptyGuid || x.accountTenantId === parseToken(this.wizard.getToken()).tid)
        )
      );
    });
  }

  createOrExistingChanged(event) {
    this.setUpformValidators();
  }

  accountChanged(accountName: DropDownElement<string>) {
    this.projectList = this.vsoAccountToProjectMap[accountName.value];
    this.selectedProject = '';
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
    this.removeFormValidators();
  }
}
