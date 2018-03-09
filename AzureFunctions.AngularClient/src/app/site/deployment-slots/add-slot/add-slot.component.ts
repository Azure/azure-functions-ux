/*
import { LogCategories } from 'app/shared/models/constants';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { LogService } from 'app/shared/services/log.service';
import { Component, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import 'rxjs/add/operator/mergeMap';

import { SlotsService } from 'app/shared/services/slots.service';
import { SlotsNode } from 'app/tree-view/slots-node';
import { GlobalStateService } from 'app/shared/services/global-state.service';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { AiService } from 'app/shared/services/ai.service';
import { CacheService } from 'app/shared/services/cache.service';
import { ArmObj, ResourceId } from 'app/shared/models/arm/arm-obj';
import { Site } from 'app/shared/models/arm/site';
import { PortalService } from 'app/shared/services/portal.service';
import { AppNode } from 'app/tree-view/app-node';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';
import { PortalResources } from 'app/shared/models/portal-resources';
import { SlotNameValidator } from 'app/shared/validators/slotNameValidator';
import { errorIds } from 'app/shared/models/error-ids';
import { AuthzService } from 'app/shared/services/authz.service';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { Subscription } from 'rxjs/Subscription';
import { Constants } from 'app/shared/models/constants';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';

interface DataModel {
    writePermission: boolean;
    readOnlyLock: boolean;
    siteInfo: any;
    appSettings: any;
    slotsList: ArmObj<Site>[];
}

@Component({
    selector: 'add-slot',
    templateUrl: './add-slot.component.html',
    styleUrls: ['./add-slot.component.scss'],
})
export class AddSlotComponent extends FeatureComponent<ResourceId> {
    public Resources = PortalResources;
    public hasCreateAcess: boolean;
    public addSlotForm: FormGroup;
    public slotNamePlaceholder: string;
    public hasReachedQuotaLimit: boolean;
    public isLoading = true;

    private _siteId: string;
    private _slotsList: ArmObj<Site>[];
    private _siteObj: ArmObj<Site>;

    constructor(
        private fb: FormBuilder,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        broadcastService: BroadcastService,
        private _portalService: PortalService,
        private _aiService: AiService,
        private _slotService: SlotsService,
        private _cacheService: CacheService,
        private _logService: LogService,
        private _functionAppService: FunctionAppService,
        private authZService: AuthzService,
        injector: Injector
    ) {
        super('AddSlotComponent', injector, 'site-tabs');
    }

    protected setup(inputEvents: Observable<ResourceId>) {
        return inputEvents
            .distinctUntilChanged()
            .switchMap(resourceId => {
                this.hasCreateAcess = false;

                this.siteArm = null;
                this.relativeSlotsArm = null;

                const siteDescriptor = new ArmSiteDescriptor(resourceId);

                this._isSlot = !!siteDescriptor.slot;
                this._resourceId = siteDescriptor.getTrimmedResourceId();

                const siteResourceId = siteDescriptor.getSiteOnlyResourceId();

                return Observable.zip(
                    this._siteService.getSite(siteResourceId),
                    this._siteService.getSlots(siteResourceId)
                );
            })
            .switchMap(r => {
                const siteResult = r[0];
                const slotsResult = r[1];
                const siteConfigResult = r[2];

                const success = siteResult.isSuccessful && slotsResult.isSuccessful && siteConfigResult.isSuccessful;

                if (!success) {
                    if (!siteResult.isSuccessful) {
                        this._logService.error(LogCategories.deploymentSlots, '/deployment-slots', siteResult.error.result);
                    } else if (!slotsResult.isSuccessful) {
                        this._logService.error(LogCategories.deploymentSlots, '/deployment-slots', slotsResult.error.result);
                    } else {
                        this._logService.error(LogCategories.deploymentSlots, '/deployment-slots', siteConfigResult.error.result);
                    }
                } else {
                    this._siteConfigArm = siteConfigResult.result;

                    if (this._isSlot) {
                        this.siteArm = slotsResult.result.value.filter(s => s.id === this._resourceId)[0];
                        this.relativeSlotsArm = slotsResult.result.value.filter(s => s.id !== this._resourceId);
                        this.relativeSlotsArm.unshift(siteResult.result);
                    } else {
                        this.siteArm = siteResult.result;
                        this.relativeSlotsArm = slotsResult.result.value;
                    }
                }

                this._setupForm();

                if (this._swapMode) {
                    this._swapMode = false;

                    if (success) {
                        this.showSwapControls();
                    }
                }

                this.clearBusyEarly();

                if (success) {
                    return Observable.zip(
                        this._authZService.hasPermission(this._resourceId, [AuthzService.writeScope]),
                        this._authZService.hasPermission(this._resourceId, [AuthzService.actionScope]),
                        this._authZService.hasReadOnlyLock(this._resourceId));
                } else {
                    return Observable.zip(
                        Observable.of(false),
                        Observable.of(false),
                        Observable.of(true)
                    );
                }
            })
            .do(r => {
                const hasWritePermission = r[1];
                const hasSwapPermission = r[2];
                const hasReadOnlyLock = r[3];

                this.hasWriteAccess = hasWritePermission && !hasReadOnlyLock;

                if (this.hasWriteAccess && hasSwapPermission) {
                    if (this._isSlot) {
                        this.hasSwapAccess = true;
                    } else {
                        this.hasSwapAccess = this.relativeSlotsArm && this.relativeSlotsArm.length > 0;
                    }
                }
            });
    }

    setupNavigation(): Subscription {
        return this.navigationEvents
            .switchMap(v => this._functionAppService.getAppContext(v.siteDescriptor.getTrimmedResourceId())
                .map(r => Object.assign(v, {
                    context: r
                })))
            .switchMap(viewInfo => {
                this._globalStateService.setBusyState();
                const validator = new RequiredValidator(this._translateService);

                // parse the site resourceId from slot's
                this._siteId = viewInfo.resourceId.substring(0, viewInfo.resourceId.indexOf('/slots'));
                const slotNameValidator = new SlotNameValidator(this.injector, this._siteId);
                this.addSlotForm = this.fb.group({
                    name: [null,
                        validator.validate.bind(validator),
                        slotNameValidator.validate.bind(slotNameValidator)]
                });

                return Observable.zip<DataModel>(
                    this.authZService.hasPermission(this._siteId, [AuthzService.writeScope]),
                    this.authZService.hasReadOnlyLock(this._siteId),
                    this._cacheService.getArm(this._siteId),
                    this._functionAppService.getSlotsList(viewInfo.context),
                    (w, rl, s, l) => ({
                        writePermission: w,
                        readOnlyLock: rl,
                        siteInfo: s,
                        slotsList: l
                    }));
            })
            .do(null, e => {
                // log error & clear busy state
                this._logService.error(LogCategories.newSlot, '/add-slot', e);
                this._globalStateService.clearBusyState();
            })
            .do(res => {
                this.hasCreateAcess = res.writePermission && !res.readOnlyLock;
                this._siteObj = <ArmObj<Site>>res.siteInfo.json();
                const sku = this._siteObj.properties.sku;
                this._slotsList = <ArmObj<Site>[]>res.slotsList;
                this.hasReachedQuotaLimit = !!sku && sku.toLowerCase() === 'dynamic' && this._slotsList.length === 1;
                this._globalStateService.clearBusyState();
                this.isLoading = false;
            });
    }

    createSlot() {
        const newSlotName = this.addSlotForm.controls['name'].value;
        let notificationId = null;
        this._globalStateService.setBusyState();
        // show create slot start notification
        this._portalService.startNotification(
            this._translateService.instant(PortalResources.slotNew_startCreateNotifyTitle).format(newSlotName),
            this._translateService.instant(PortalResources.slotNew_startCreateNotifyTitle).format(newSlotName))
            .first()
            .switchMap(s => {
                notificationId = s.id;
                return this._slotService.createNewSlot(this._siteObj.id, newSlotName, this._siteObj.location, this._siteObj.properties.serverFarmId);
            })
            .subscribe((r) => {
                this._globalStateService.clearBusyState();
                // update notification
                this._portalService.stopNotification(
                    notificationId,
                    true,
                    this._translateService.instant(PortalResources.slotNew_startCreateSuccessNotifyTitle).format(newSlotName));
                let slotsNode = <SlotsNode>this.viewInfo.node;

                // If someone refreshed the app, it would created a new set of child nodes under the app node.
                slotsNode = <SlotsNode>this.viewInfo.node.parent.children.find(node => node.title === slotsNode.title);
                slotsNode.addChild(<ArmObj<Site>>r.json());
                slotsNode.isExpanded = true;
            }, err => {
                this._globalStateService.clearBusyState();
                this._portalService.stopNotification(
                    notificationId,
                    false,
                    this._translateService.instant(PortalResources.slotNew_startCreateFailureNotifyTitle).format(newSlotName));
                this.showComponentError({
                    message: this._translateService.instant(PortalResources.slotNew_startCreateFailureNotifyTitle).format(newSlotName),
                    details: this._translateService.instant(PortalResources.slotNew_startCreateFailureNotifyTitle).format(newSlotName),
                    errorId: errorIds.failedToCreateSlot,
                    resourceId: this._siteObj.id
                });
                this._aiService.trackEvent(errorIds.failedToCreateApp, { error: err, id: this._siteObj.id });
            });
    }
}
*/