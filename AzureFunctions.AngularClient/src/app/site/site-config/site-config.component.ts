import { CacheService } from 'app/shared/services/cache.service';
import { Site } from 'app/shared/models/arm/site';
import { SiteConfig } from 'app/shared/models/arm/site-config';
import { SlotConfigNames } from 'app/shared/models/arm/slot-config-names';
import { ApplicationSettings } from 'app/shared/models/arm/application-settings';
import { ConnectionStrings } from 'app/shared/models/arm/connection-strings';
import { ArmObj } from 'app/shared/models/arm/arm-obj';
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
import { DefaultDocumentsComponent } from './default-documents/default-documents.component';
import { HandlerMappingsComponent } from './handler-mappings/handler-mappings.component';
import { VirtualDirectoriesComponent } from './virtual-directories/virtual-directories.component';
import { PortalService } from './../../shared/services/portal.service';
import { AuthzService } from './../../shared/services/authz.service';
import { LogCategories, SiteTabIds } from './../../shared/models/constants';
import { BroadcastService } from './../../shared/services/broadcast.service';
import { LogService } from './../../shared/services/log.service';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';

export interface ArmSaveConfigs {
    siteConfig?: ArmObj<Site>;
    slotConfigNames?: ArmObj<SlotConfigNames>;
    appSettings?: ArmObj<ApplicationSettings>;
    connectionStrings?: ArmObj<ConnectionStrings>;
    webConfig?: ArmObj<SiteConfig>;
}

export interface ArmResult<T> {
    success: boolean;
    error?: string;
    result?: ArmObj<T>;
}

export interface ArmSaveResults {
    siteConfig?: ArmResult<Site>;
    slotConfigNames?: ArmResult<SlotConfigNames>;
    applicationSettings?: ArmResult<ApplicationSettings>;
    connectionStrings?: ArmResult<ConnectionStrings>;
    webConfig?: ArmResult<SiteConfig>;
}

@Component({
    selector: 'site-config',
    templateUrl: './site-config.component.html',
    styleUrls: ['./site-config.component.scss']
})
export class SiteConfigComponent implements OnDestroy {
    public viewInfoStream: Subject<TreeViewInfo<SiteData>>;
    private _viewInfoSubscription: RxSubscription;
    public hasWritePermissions = true;

    public defaultDocumentsSupported = false;
    public handlerMappingsSupported = false;
    public virtualDirectoriesSupported = false;

    public mainForm: FormGroup;
    private _valueSubscription: RxSubscription;
    public resourceId: string;
    public resourceType: string;
    public dirtyMessage: string;

    private _busyManager: BusyStateScopeManager;

    @Input() set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
        this.viewInfoStream.next(viewInfo);
    }

    @ViewChild(GeneralSettingsComponent) generalSettings: GeneralSettingsComponent;
    @ViewChild(AppSettingsComponent) appSettings: AppSettingsComponent;
    @ViewChild(ConnectionStringsComponent) connectionStrings: ConnectionStringsComponent;
    @ViewChild(DefaultDocumentsComponent) defaultDocuments: DefaultDocumentsComponent;
    @ViewChild(HandlerMappingsComponent) handlerMappings: HandlerMappingsComponent;
    @ViewChild(VirtualDirectoriesComponent) virtualDirectories: VirtualDirectoriesComponent;

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
                return this._cacheService.getArm(res.resourceId)
                    .map(site => {
                        this._site = <ArmObj<Site>>site.json();
                        return res;
                    });
            })
            .do(null, error => {
                this.resourceId = null;
                this._setupForm();
                this._logService.error(LogCategories.siteConfig, '/site-config', error);
                this._busyManager.clearBusy();
            })
            .retry()
            .subscribe(r => {
                this.hasWritePermissions = r.writePermission && !r.readOnlyLock;
                if (!ArmUtil.isLinuxApp(this._site)) {
                    this.defaultDocumentsSupported = true;
                    this.handlerMappingsSupported = true;
                    this.virtualDirectoriesSupported = true;
                }
                this.resourceId = r.resourceId;
                this._setupForm();
                this._busyManager.clearBusy();
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

        if (this.mainForm.valid) {

            this._busyManager.setBusy();
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

            this._portalService.startNotification(
                this._translateService.instant(PortalResources.configUpdating),
                this._translateService.instant(PortalResources.configUpdating))
                .first()
                .switchMap(s => {
                    notificationId = s.id;

                    return Observable.zip(
                        this._putArm(saveConfigs.siteConfig),
                        this._putArm(saveConfigs.slotConfigNames),
                        this._putArm(saveConfigs.appSettings),
                        this._putArm(saveConfigs.connectionStrings),
                        this._putArm(saveConfigs.webConfig),
                        (sc, scn, as, cs, wc) => ({
                            siteConfig: sc,
                            slotConfigNames: scn,
                            applicationSettings: as,
                            connectionStrings: cs,
                            webConfig: wc
                        })
                    );
                })
                .subscribe(results => {
                    this.dirtyMessage = null;
                    this._busyManager.clearBusy();

                    const saveResults: ArmSaveResults = results;

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

                    const saveErrors: string[] = Object.keys(saveResults)
                        .map(k => saveResults[k] as { error?: string })
                        .filter(r => !!r && !!r.error)
                        .map(r => r.error);

                    const saveSuccess: boolean = !saveErrors || saveErrors.length === 0;
                    const saveNotification = saveSuccess ?
                        this._translateService.instant(PortalResources.configUpdateSuccess) :
                        this._translateService.instant(PortalResources.configUpdateFailure) + JSON.stringify(saveErrors);

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

    private _putArm<T>(armObj: ArmObj<T>): Observable<ArmResult<T>> {
        if (!armObj) {
            return Observable.of(null);
        }

        return this._cacheService.putArm(armObj.id, null, armObj)
            .map(res => {
                return {
                    success: true,
                    result: res.json()
                };
            })
            .catch(error => {
                return Observable.of({
                    success: false,
                    error: error._body
                });
            });
    }

    discard() {
        this._setupForm();
    }
}
