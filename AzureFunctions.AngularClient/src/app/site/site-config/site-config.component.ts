import { SiteService } from 'app/shared/services/site.service';
import { Injector } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { CacheService } from 'app/shared/services/cache.service';
import { Site } from './../../shared/models/arm/site';
import { ApplicationSettings } from './../../shared/models/arm/application-settings';
import { ConnectionStrings } from './../../shared/models/arm/connection-strings';
import { SlotConfigNames } from './../../shared/models/arm/slot-config-names';
import { ArmObj, ArmObjMap } from './../../shared/models/arm/arm-obj';
import { Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
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
import { LogCategories, SiteTabIds } from './../../shared/models/constants';
import { LogService } from './../../shared/services/log.service';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';
import { FeatureComponent } from 'app/shared/components/feature-component';

export interface SaveOrValidationResult {
    success: boolean;
    error?: string;
}

@Component({
    selector: 'site-config',
    templateUrl: './site-config.component.html',
    styleUrls: ['./site-config.component.scss']
})
export class SiteConfigComponent extends FeatureComponent<TreeViewInfo<SiteData>> implements OnDestroy {
    public hasWritePermissions = true;

    public defaultDocumentsSupported = false;
    public handlerMappingsSupported = false;
    public virtualDirectoriesSupported = false;

    public mainForm: FormGroup;
    private _valueSubscription: RxSubscription;
    public resourceId: string;
    public resourceType: string;
    public dirtyMessage: string;

    @Input() set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
        this.setInput(viewInfo);
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
        private _authZService: AuthzService,
        private _cacheService: CacheService,
        private _siteService: SiteService,
        injector: Injector
    ) {
        super('SiteConfigComponent', injector, 'site-tabs');

        // For ibiza scenarios, this needs to match the deep link feature name used to load this in ibiza menu
        this.featureName = 'settings';
        this.isParentComponent = true;
    }

    protected setup(inputEvents: Observable<TreeViewInfo<SiteData>>) {
        return inputEvents
            .distinctUntilChanged()
            .switchMap(viewInfo => {
                this.resourceId = viewInfo.resourceId;
                return this._siteService.getSite(viewInfo.resourceId)
            })
            .switchMap(r => {
                this._site = r.result;

                if (!ArmUtil.isLinuxApp(this._site)) {
                    this.defaultDocumentsSupported = true;
                    this.handlerMappingsSupported = true;
                    this.virtualDirectoriesSupported = true;
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

        if (this.mainForm.valid) {

            this.setBusy();
            let notificationId = null;
            let saveAttempted = false;

            this._portalService.startNotification(
                this._translateService.instant(PortalResources.configUpdating),
                this._translateService.instant(PortalResources.configUpdating))
                .first()
                .switchMap(s => {
                    notificationId = s.id;

                    // This is a temporary workaround for merging the slotConfigNames config from AppSettingsModule and ConnectionStringsModule.
                    // Adding a proper solution (for all config APIs) is tracked here: https://github.com/Azure/azure-functions-ux/issues/1856
                    const asConfig: ArmObjMap = this.appSettings.getConfigForSave();
                    const csConfig: ArmObjMap = this.connectionStrings.getConfigForSave();

                    let appSettingsArm: ArmObj<ApplicationSettings> = null;
                    let asSlotConfigNamesArm: ArmObj<SlotConfigNames> = null;

                    let connectionStringsArm: ArmObj<ConnectionStrings> = null;
                    let csSlotConfigNamesArm: ArmObj<SlotConfigNames> = null;

                    let slotConfigNamesArm: ArmObj<SlotConfigNames> = null;

                    const errors: string[] = [];

                    // asConfig will be null if neither /config/appSettings or /config/slotConfigNames.appSettingNames have changes to be saved
                    if (asConfig) {
                        if (asConfig['appSettings']) {
                            // there are changes to be saved for /config/appSettings
                            appSettingsArm = asConfig['appSettings'];
                        }
                        if (asConfig['slotConfigNames']) {
                            // there are changes to be saved for /config/slotConfigNames.appSettingNames
                            asSlotConfigNamesArm = JSON.parse(JSON.stringify(asConfig['slotConfigNames']));
                        }
                        if (asConfig.error) {
                            errors.push(asConfig.error);
                        }
                    }

                    // csConfig will be null if neither /config/connectionStrings or /config/slotConfigNames.connectionStringNames have changes to be saved
                    if (csConfig) {
                        if (csConfig['connectionStrings']) {
                            // there are changes to be saved for /config/appSettings
                            connectionStringsArm = csConfig['connectionStrings'];
                        }
                        if (csConfig['slotConfigNames']) {
                            // there are changes to be saved for /config/slotConfigNames.connectionStringNames
                            csSlotConfigNamesArm = JSON.parse(JSON.stringify(csConfig['slotConfigNames']));
                        }
                        if (csConfig.error) {
                            errors.push(csConfig.error);
                        }
                    }

                    if (errors.length > 0) {
                        return Observable.throw(errors);
                    }

                    if (asSlotConfigNamesArm && csSlotConfigNamesArm) {
                        // If there are changes to both /config/slotConfigNames.appSettingNames and /config/slotConfigNames.connectionStringNames,
                        // so merge the changes into a single /config/slotConfigNames payload.
                        slotConfigNamesArm = asSlotConfigNamesArm;
                        slotConfigNamesArm.properties.connectionStringNames = csSlotConfigNamesArm.properties.connectionStringNames;
                    } else {
                        // At most one of the /config/slotConfigNames.* properties has changes. Select the config that has changes (or null if neither has changes).
                        slotConfigNamesArm = asSlotConfigNamesArm || csSlotConfigNamesArm;
                    }

                    return Observable.zip(
                        // Don't make the PUT call if there are no /config/slotConfigNames to submit.
                        slotConfigNamesArm ? this._cacheService.putArm(slotConfigNamesArm.id, null, slotConfigNamesArm) : Observable.of(null),
                        Observable.of(appSettingsArm),
                        Observable.of(connectionStringsArm),
                        (sc, a, c) => ({ slotConfigNamesResult: sc, appSettingsArm: a, connectionStringsArm: c })
                    );
                })
                .mergeMap(r => {
                    saveAttempted = true;
                    return Observable.zip(
                        this.generalSettings.save(),
                        this.appSettings.save(r.appSettingsArm, r.slotConfigNamesResult),
                        this.connectionStrings.save(r.connectionStringsArm, r.slotConfigNamesResult),
                        this.defaultDocumentsSupported ? this.defaultDocuments.save() : Observable.of({ success: true }),
                        this.handlerMappingsSupported ? this.handlerMappings.save() : Observable.of({ success: true }),
                        this.virtualDirectoriesSupported ? this.virtualDirectories.save() : Observable.of({ success: true }),
                        (g, a, c, d, h, v) => ({
                            generalSettingsResult: g,
                            appSettingsResult: a,
                            connectionStringsResult: c,
                            defaultDocumentsResult: d,
                            handlerMappingsResult: h,
                            virtualDirectoriesResult: v
                        })
                    );
                })
                .do(null, error => {
                    this.dirtyMessage = null;
                    this._logService.error(LogCategories.siteConfig, '/site-config', error);
                    this.clearBusy();
                    if (saveAttempted) {
                        this._setupForm(true /*retain dirty state*/);
                        this.mainForm.markAsDirty();
                    }
                    this._portalService.stopNotification(
                        notificationId,
                        false,
                        this._translateService.instant(PortalResources.configUpdateFailure) + JSON.stringify(error));
                })
                .subscribe(r => {
                    this.dirtyMessage = null;
                    this.clearBusy();

                    const saveResults: SaveOrValidationResult[] = [
                        r.generalSettingsResult,
                        r.appSettingsResult,
                        r.connectionStringsResult,
                        r.defaultDocumentsResult,
                        r.handlerMappingsResult,
                        r.virtualDirectoriesResult
                    ];
                    const saveFailures: string[] = saveResults.filter(res => !res.success).map(res => res.error);
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
    }

    discard() {
        this._setupForm();
    }
}
