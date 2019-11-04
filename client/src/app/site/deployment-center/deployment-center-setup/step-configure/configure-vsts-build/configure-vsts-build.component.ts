import { Component, OnDestroy } from '@angular/core';
import { SelectOption } from '../../../../../shared/models/select-option';
import { DeploymentCenterStateManager } from '../../wizard-logic/deployment-center-state-manager';
import { Subject } from 'rxjs/Subject';
import { CacheService } from '../../../../../shared/services/cache.service';
import { DropDownElement } from '../../../../../shared/models/drop-down-element';
import { LogService } from '../../../../../shared/services/log.service';
import { LogCategories } from '../../../../../shared/models/constants';
import { TranslateService } from '@ngx-translate/core';
import { RequiredValidator } from '../../../../../shared/validators/requiredValidator';
import { PortalResources } from '../../../../../shared/models/portal-resources';
import { VstsValidators } from '../../validators/vsts-validators';
import { AzureDevOpsService } from '../../wizard-logic/azure-devops.service';

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
  public projectListLoading = false;
  private _memberIdSubscription = new Subject();
  private _accountSubscription = new Subject<string>();

  selectedAccount = '';
  selectedProject = '';
  selectedLocation = '';

  constructor(
    private _translateService: TranslateService,
    private _cacheService: CacheService,
    public wizard: DeploymentCenterStateManager,
    private _logService: LogService,
    private _azureDevOpsService: AzureDevOpsService
  ) {
    this.newVsoAccountOptions = [
      { displayLabel: this._translateService.instant(PortalResources.new), value: true },
      { displayLabel: this._translateService.instant(PortalResources.existing), value: false },
    ];

    this.setupSubscriptions();
    this._memberIdSubscription.next();
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
          VstsValidators.createVstsAccountNameValidator(
            this.wizard,
            this._translateService,
            this._azureDevOpsService,
            this._cacheService
          ).bind(this),
        ]);
      this.wizard.buildSettings.get('vstsProject').setAsyncValidators([]);
      this.wizard.buildSettings.get('vstsAccount').valueChanges.subscribe(account => {
        this.wizard.buildSettings.get('vstsProject').setValue('MyProject');
      });
      this.wizard.buildSettings.get('vstsProject').setValidators([]);
      this.wizard.buildSettings.setAsyncValidators([]);
    } else {
      this.selectedProject = '';
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
            this._azureDevOpsService,
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
    this._memberIdSubscription
      .takeUntil(this._ngUnsubscribe$)
      .do(() => (this.accountListLoading = true))
      .concatMap(() => this._azureDevOpsService.getAccounts())
      .do(() => (this.accountListLoading = false))
      .subscribe(
        r => {
          this.accountList = r.map(account => ({
            displayLabel: account.AccountName,
            value: account.AccountName,
          }));
        },
        err => {
          this._logService.error(LogCategories.cicd, '/fetch-vso-profile-repo-data', err);
        }
      );

    this._accountSubscription
      .takeUntil(this._ngUnsubscribe$)
      .do(() => (this.projectListLoading = true))
      .switchMap(r => this._azureDevOpsService.getProjectsForAccount(r))
      .do(() => (this.projectListLoading = false))
      .subscribe(r => {
        this.projectList = r.value.map(x => ({
          displayLabel: x.name,
          value: x.name,
        }));
      });

    this._cacheService.get(AzureDevOpsService.AzDevRegionsApi, true, this._azureDevOpsService.getAzDevDirectHeaders(false)).subscribe(
      r => {
        const locationArray: any[] = r.json().value;
        this.locationList = locationArray.map(v => {
          return {
            displayLabel: v.displayName,
            value: v.name,
          };
        });
      },
      err => {
        this._logService.error(LogCategories.cicd, '/fetch-vso-available-locations', err);
      }
    );
  }

  createOrExistingChanged(event) {
    this.setUpformValidators();
  }

  accountChanged(accountName: DropDownElement<string>) {
    this._accountSubscription.next(accountName.value);
    this.selectedProject = '';
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
    this.removeFormValidators();
  }
}
