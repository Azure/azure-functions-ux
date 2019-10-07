import { SiteService } from 'app/shared/services/site.service';
import { Observable } from 'rxjs/Rx';
import { CacheService } from 'app/shared/services/cache.service';
import { Site } from './../../shared/models/arm/site';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { Component, Injector, Input, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { ARMApiVersions } from './../../shared/models/constants';
import { PortalResources } from './../../shared/models/portal-resources';
import { TreeViewInfo, SiteData } from './../../tree-view/models/tree-view-info';
import { GeneralSettingsComponent } from './general-settings/general-settings.component';
import { AppSettingsComponent } from './app-settings/app-settings.component';
import { ConnectionStringsComponent } from './connection-strings/connection-strings.component';
import { DefaultDocumentsComponent } from './default-documents/default-documents.component';
import { HandlerMappingsComponent } from './handler-mappings/handler-mappings.component';
import { VirtualDirectoriesComponent } from './virtual-directories/virtual-directories.component';
import { PortalService } from './../../shared/services/portal.service';
import { AuthzService } from './../../shared/services/authz.service';
import { LogCategories, SiteTabIds, ScenarioIds } from './../../shared/models/constants';
import { LogService } from './../../shared/services/log.service';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { ArmSaveConfigs, ArmSaveResult, ArmSaveResults } from 'app/shared/components/config-save-component';
import { ScenarioService } from 'app/shared/services/scenario/scenario.service';
import { MountStorageComponent } from './mount-storage/mount-storage.component';

export interface SaveOrValidationResult {
  success: boolean;
  error?: string;
}

@Component({
  selector: 'site-config',
  templateUrl: './site-config.component.html',
  styleUrls: ['./site-config.component.scss'],
})
export class SiteConfigComponent extends FeatureComponent<TreeViewInfo<SiteData>> implements OnDestroy {
  public hasWritePermissions = true;

  public defaultDocumentsSupported = false;
  public handlerMappingsSupported = false;
  public virtualDirectoriesSupported = false;
  public byosSupported = false;

  public mainForm: FormGroup;
  private _valueSubscription: RxSubscription;
  public resourceId: string;
  public resourceType: string;
  public dirtyMessage: string;

  @Input()
  set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
    this.setInput(viewInfo);
  }

  @ViewChild(GeneralSettingsComponent)
  generalSettings: GeneralSettingsComponent;
  @ViewChild(AppSettingsComponent)
  appSettings: AppSettingsComponent;
  @ViewChild(ConnectionStringsComponent)
  connectionStrings: ConnectionStringsComponent;
  @ViewChild(DefaultDocumentsComponent)
  defaultDocuments: DefaultDocumentsComponent;
  @ViewChild(HandlerMappingsComponent)
  handlerMappings: HandlerMappingsComponent;
  @ViewChild(VirtualDirectoriesComponent)
  virtualDirectories: VirtualDirectoriesComponent;
  @ViewChild(MountStorageComponent)
  mountStorage: MountStorageComponent;

  private _site: ArmObj<Site>;

  constructor(
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _portalService: PortalService,
    private _logService: LogService,
    private _authZService: AuthzService,
    private _cacheService: CacheService,
    private _siteService: SiteService,
    private _scenarioService: ScenarioService,
    injector: Injector
  ) {
    super('site-config', injector, SiteTabIds.applicationSettings);

    // For ibiza scenarios, this needs to match the deep link feature name used to load this in ibiza menu
    this.featureName = 'settings';
    this.isParentComponent = true;
  }

  protected setup(inputEvents: Observable<TreeViewInfo<SiteData>>) {
    return inputEvents
      .distinctUntilChanged()
      .switchMap(viewInfo => {
        this.resourceId = viewInfo.resourceId;
        return this._siteService.getSite(viewInfo.resourceId);
      })
      .switchMap(r => {
        this._site = r.result;

        if (!ArmUtil.isLinuxApp(this._site)) {
          this.defaultDocumentsSupported = true;
          this.handlerMappingsSupported = true;
          this.virtualDirectoriesSupported = true;
        }

        if (this._scenarioService.checkScenario(ScenarioIds.defaultDocumentsSupported, { site: this._site }).status === 'disabled') {
          this.defaultDocumentsSupported = false;
        }

        if (this._scenarioService.checkScenario(ScenarioIds.handlerMappingsSupported, { site: this._site }).status === 'disabled') {
          this.handlerMappingsSupported = false;
        }

        if (this._scenarioService.checkScenario(ScenarioIds.virtualDirectoriesSupported, { site: this._site }).status === 'disabled') {
          this.virtualDirectoriesSupported = false;
        }

        if (this._scenarioService.checkScenario(ScenarioIds.byosSupported, { site: this._site }).status === 'disabled') {
          this.byosSupported = false;
        } else {
          this.byosSupported = true;
        }

        this._setupForm();

        this.clearBusyEarly();
        return Observable.zip<boolean>(
          this._authZService.hasPermission(this.resourceId, [AuthzService.writeScope]),
          this._authZService.hasReadOnlyLock(this.resourceId)
        );
      })
      .do(results => {
        const writePermission = results[0];
        const readonlyLock = results[1];
        this.hasWritePermissions = writePermission && !readonlyLock;
      });
  }

  private _setupForm(retainDirtyState?: boolean) {
    this.mainForm = this._fb.group({});

    if (!retainDirtyState) {
      this._broadcastService.clearDirtyState(SiteTabIds.applicationSettings);
    }

    if (this._valueSubscription) {
      this._valueSubscription.unsubscribe();
    }

    this._valueSubscription = this.mainForm.valueChanges.subscribe(() => {
      // There isn't a callback for dirty state on a form, so this is a workaround.
      if (this.mainForm.dirty) {
        this._broadcastService.setDirtyState(SiteTabIds.applicationSettings);
      } else {
        this._broadcastService.clearDirtyState(SiteTabIds.applicationSettings);
      }
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();

    if (this._valueSubscription) {
      this._valueSubscription.unsubscribe();
      this._valueSubscription = null;
    }
    this.clearBusy();
    this._broadcastService.clearDirtyState(SiteTabIds.applicationSettings);
  }

  save() {
    this.dirtyMessage = this._translateService.instant(PortalResources.saveOperationInProgressWarning);

    this.generalSettings.validate();
    this.appSettings.validate();
    this.connectionStrings.validate();

    if (this.defaultDocumentsSupported) {
      this.defaultDocuments.validate();
    }
    if (this.handlerMappingsSupported) {
      this.handlerMappings.validate();
    }
    if (this.virtualDirectoriesSupported) {
      this.virtualDirectories.validate();
    }
    if (this.byosSupported) {
      this.mountStorage.validate();
    }

    if (this.mainForm.valid) {
      this.setBusy();
      let notificationId = null;

      const saveConfigs: ArmSaveConfigs = {};

      this.generalSettings.getSaveConfigs(saveConfigs);
      this.appSettings.getSaveConfigs(saveConfigs);
      this.connectionStrings.getSaveConfigs(saveConfigs);

      if (this.defaultDocumentsSupported) {
        this.defaultDocuments.getSaveConfigs(saveConfigs);
      }
      if (this.handlerMappingsSupported) {
        this.handlerMappings.getSaveConfigs(saveConfigs);
      }
      if (this.virtualDirectoriesSupported) {
        this.virtualDirectories.getSaveConfigs(saveConfigs);
      }
      if (this.byosSupported) {
        this.mountStorage.getSaveConfigs(saveConfigs);
      }

      this._portalService
        .startNotification(
          this._translateService.instant(PortalResources.configUpdating),
          this._translateService.instant(PortalResources.configUpdating)
        )
        .first()
        .switchMap(s => {
          notificationId = s.id;

          return Observable.zip(
            this._putArm(saveConfigs.appSettingsArm),
            this._putArm(saveConfigs.connectionStringsArm),
            this._putArm(saveConfigs.siteArm),
            this._putArm(saveConfigs.siteConfigArm, ARMApiVersions.antaresApiVersion20181101),
            this._putArm(saveConfigs.slotConfigNamesArm),
            this._putArm(saveConfigs.azureStorageAccountsArm)
          );
        })
        .subscribe(results => {
          this.dirtyMessage = null;
          this.clearBusy();

          const saveResults: ArmSaveResults = {
            appSettings: results[0],
            connectionStrings: results[1],
            site: results[2],
            siteConfig: results[3],
            slotConfigNames: results[4],
            azureStorageAccounts: results[5],
          };

          this.generalSettings.processSaveResults(saveResults);
          this.appSettings.processSaveResults(saveResults);
          this.connectionStrings.processSaveResults(saveResults);

          if (this.defaultDocumentsSupported) {
            this.defaultDocuments.processSaveResults(saveResults);
          }
          if (this.handlerMappingsSupported) {
            this.handlerMappings.processSaveResults(saveResults);
          }
          if (this.virtualDirectoriesSupported) {
            this.virtualDirectories.processSaveResults(saveResults);
          }
          if (this.byosSupported) {
            this.mountStorage.processSaveResults(saveResults);
          }

          const saveErrors: string[] = [];
          results.forEach(result => {
            if (result && !result.success) {
              saveErrors.push(result.error);
              this._logService.error(LogCategories.siteConfig, '/site-config', result.error);
            }
          });
          const saveSuccess: boolean = !saveErrors || saveErrors.length === 0;
          const saveNotification = saveSuccess
            ? this._translateService.instant(PortalResources.configUpdateSuccess)
            : this._translateService.instant(PortalResources.configUpdateFailure) + JSON.stringify(saveErrors);

          // Even if the save failed, we still need to regenerate mainForm since each child component is saves independently, maintaining its own save state.
          // Here we regenerate mainForm (and mark it as dirty on failure), which triggers _setupForm() to run on the child components. In _setupForm(), the child components
          // with a successful save state regenerate their form before adding it to mainForm, while those with an unsuccessful save state just add their existing form to mainForm.
          this._setupForm(!saveSuccess);
          if (!saveSuccess) {
            this.mainForm.markAsDirty();
          }

          this._portalService.stopNotification(notificationId, saveSuccess, saveNotification);
        });
    }
  }

  private _putArm<T>(armObj: ArmObj<T>, apiVersion?: string): Observable<ArmSaveResult<T>> {
    if (!armObj) {
      return Observable.of(null);
    }

    return this._cacheService
      .putArm(armObj.id, apiVersion, armObj)
      .map(res => {
        return {
          success: true,
          value: res.json(),
        };
      })
      .catch(error => {
        return Observable.of({
          success: false,
          error: error._body,
        });
      });
  }

  discard() {
    const proceed = confirm(this._translateService.instant(PortalResources.unsavedChangesWarning));
    if (proceed) {
      this._setupForm();
    }
  }
}
