import { CacheService } from 'app/shared/services/cache.service';
import { Site } from './../../shared/models/arm/site';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { PortalResources } from './../../shared/models/portal-resources';
import { BusyStateScopeManager } from './../../busy-state/busy-state-scope-manager';
import { TreeViewInfo, SiteData } from './../../tree-view/models/tree-view-info';
import { GeneralSettingsComponent } from './general-settings/general-settings.component';
import { AppSettingsComponent } from './app-settings/app-settings.component';
import { ConnectionStringsComponent } from './connection-strings/connection-strings.component';
import { PortalService } from './../../shared/services/portal.service';
import { AuthzService } from './../../shared/services/authz.service';
import { SiteTabIds } from './../../shared/models/constants';
import { BroadcastService } from './../../shared/services/broadcast.service';
import { LogCategories } from 'app/shared/models/constants';
import { LogService } from './../../shared/services/log.service';

export interface SaveResult {
  success: boolean;
  error?: string;
}

@Component({
  selector: 'site-config',
  templateUrl: './site-config.component.html',
  styleUrls: ['./site-config.component.scss']
})
export class SiteConfigComponent implements OnDestroy {
  public viewInfoStream: Subject<TreeViewInfo<SiteData>>;
  private _viewInfoSubscription: RxSubscription;
  private _writePermission = true;
  private _readOnlyLock = false;
  public hasWritePermissions = true;

  public mainForm: FormGroup;
  private _valueSubscription: RxSubscription;
  public resourceId: string;

  private _busyManager: BusyStateScopeManager;

  @Input() set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
    this.viewInfoStream.next(viewInfo);
  }

  @ViewChild(GeneralSettingsComponent) generalSettings: GeneralSettingsComponent;
  @ViewChild(AppSettingsComponent) appSettings: AppSettingsComponent;
  @ViewChild(ConnectionStringsComponent) connectionStrings: ConnectionStringsComponent;

  private _site: ArmObj<Site>;

  constructor(
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _portalService: PortalService,
    private _logService: LogService,
    private _broadcastService: BroadcastService,
    private _authZService: AuthzService,
    private _cacheService: CacheService
  ) {
    this._busyManager = new BusyStateScopeManager(_broadcastService, 'site-tabs');

    this.viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
    this._viewInfoSubscription = this.viewInfoStream
      .distinctUntilChanged()
      .switchMap(viewInfo => {
        this._busyManager.setBusy();
        return Observable.zip(
          Observable.of(viewInfo.resourceId),
          this._authZService.hasPermission(viewInfo.resourceId, [AuthzService.writeScope]),
          this._authZService.hasReadOnlyLock(viewInfo.resourceId),
          (r, wp, rl) => ({ resourceId: r, writePermission: wp, readOnlyLock: rl })
        );
      })
      .switchMap(res => {
        if (res.writePermission && !res.readOnlyLock) {
          return this._cacheService.getArm(res.resourceId)
            .map(site => {
              this._site = <ArmObj<Site>>site.json();
              return res;
            });
        } else {
          return Observable.of(res);
        }
      })
      .do(null, error => {
        this.resourceId = null;
        this._setupForm();
        this._logService.error(LogCategories.siteConfig, '/site-config', error);
        this._busyManager.clearBusy();
      })
      .retry()
      .subscribe(r => {
        this._writePermission = r.writePermission;
        this._readOnlyLock = r.readOnlyLock;
        this.hasWritePermissions = r.writePermission && !r.readOnlyLock;
        this.resourceId = r.resourceId;
        this._setupForm();
        this._busyManager.clearBusy();
      });
  }

  scaleUp() {
    const inputs = {
      aspResourceId: this._site.properties.serverFarmId,
      aseResourceId: this._site.properties.hostingEnvironmentProfile
      && this._site.properties.hostingEnvironmentProfile.id
    };

    const openScaleUpBlade = this._portalService.openCollectorBladeWithInputs(
      '',
      inputs,
      'site-manage',
      (value => {
        console.log('return from scale');
      }),
      'WebsiteSpecPickerV3');

    openScaleUpBlade
      .first()
      .subscribe(r => {
        if(r){
          console.log('final call back succeeded!');
        } else{
          console.log('final call back was cancelled');
        }
      },
      e => {
        console.log('final call back failed!');
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
      }
    });
  }

  ngOnDestroy(): void {
    if (this._viewInfoSubscription) {
      this._viewInfoSubscription.unsubscribe();
      this._viewInfoSubscription = null;
    }
    if (this._valueSubscription) {
      this._valueSubscription.unsubscribe();
      this._valueSubscription = null;
    }
    this._busyManager.clearBusy();
    this._broadcastService.clearDirtyState(SiteTabIds.applicationSettings);
  }

  save() {
    this.generalSettings.validate();
    this.appSettings.validate();
    this.connectionStrings.validate();

    this._busyManager.setBusy();
    let notificationId = null;
    this._portalService.startNotification(
      this._translateService.instant(PortalResources.configUpdating),
      this._translateService.instant(PortalResources.configUpdating))
      .first()
      .switchMap(s => {
        notificationId = s.id;
        return Observable.zip(
          this.generalSettings.save(),
          this.appSettings.save(),
          this.connectionStrings.save(),
          (g, a, c) => ({ generalSettingsResult: g, appSettingsResult: a, connectionStringsResult: c })
        );
      })
      .do(null, error => {
        this._logService.error(LogCategories.siteConfig, '/site-config', error);
        this._busyManager.clearBusy();
        this._setupForm(true /*retain dirty state*/);
        this.mainForm.markAsDirty();
        this._portalService.stopNotification(notificationId, false, '');
      })
      .subscribe(r => {
        this._busyManager.clearBusy();

        const saveResults: SaveResult[] = [r.generalSettingsResult, r.appSettingsResult, r.connectionStringsResult];
        const saveFailures: string[] = saveResults.filter(r => !r.success).map(r => r.error);
        const saveSuccess: boolean = saveFailures.length === 0;
        const saveNotification = saveSuccess ?
          this._translateService.instant(PortalResources.configUpdateSuccess) :
          this._translateService.instant(PortalResources.configUpdateFailure) + JSON.stringify(saveFailures);

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

  discard() {
    this._setupForm();
  }
}