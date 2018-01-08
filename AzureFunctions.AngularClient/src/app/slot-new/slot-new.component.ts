import { LogCategories } from './../shared/models/constants';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { LogService } from './../shared/services/log.service';
import { Component, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import 'rxjs/add/operator/mergeMap';

import { SlotsService } from '../shared/services/slots.service';
import { SlotsNode } from '../tree-view/slots-node';
import { GlobalStateService } from '../shared/services/global-state.service';
import { BroadcastService } from '../shared/services/broadcast.service';
import { AiService } from '../shared/services/ai.service';
import { CacheService } from '../shared/services/cache.service';
import { ArmObj } from '../shared/models/arm/arm-obj';
import { Site } from '../shared/models/arm/site';
import { PortalService } from '../shared/services/portal.service';
import { AppNode } from '../tree-view/app-node';
import { RequiredValidator } from '../shared/validators/requiredValidator';
import { PortalResources } from '../shared/models/portal-resources';
import { SlotNameValidator } from '../shared/validators/slotNameValidator';
import { errorIds } from '../shared/models/error-ids';
import { AuthzService } from '../shared/services/authz.service';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { Subscription } from 'rxjs/Subscription';
import { Constants } from 'app/shared/models/constants';
import { NavigableComponent } from '../shared/components/navigable-component';

interface DataModel {
    writePermission: boolean;
    readOnlyLock: boolean;
    siteInfo: any;
    appSettings: any;
    slotsList: ArmObj<Site>[];
}

@Component({
    selector: 'slot-new',
    templateUrl: './slot-new.component.html',
    styleUrls: ['./slot-new.component.scss'],
})
export class SlotNewComponent extends NavigableComponent {
    public Resources = PortalResources;
    public slotOptinEnabled: boolean;
    public hasCreatePermissions: boolean;
    public newSlotForm: FormGroup;
    public slotNamePlaceholder: string;
    public hasReachedDynamicQuotaLimit: boolean;
    public isLoading = true;

    private _slotsNode: SlotsNode;
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
        private injector: Injector) {
        super('slot-new', broadcastService, DashboardType.CreateSlotDashboard);
    }

    setupNavigation(): Subscription {
        return this.navigationEvents
            .switchMap(v => this._functionAppService.getAppContext(v.siteDescriptor.getTrimmedResourceId())
                .map(r => Object.assign(v, {
                    context: r
                })))
            .switchMap(viewInfo => {
                this._globalStateService.setBusyState();
                this._slotsNode = <SlotsNode>viewInfo.node;
                const validator = new RequiredValidator(this._translateService);

                // parse the site resourceId from slot's
                this._siteId = viewInfo.resourceId.substring(0, viewInfo.resourceId.indexOf('/slots'));
                const slotNameValidator = new SlotNameValidator(this.injector, this._siteId);
                this.newSlotForm = this.fb.group({
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
            .mergeMap(res => {
                this.hasCreatePermissions = res.writePermission && !res.readOnlyLock;
                if (this.hasCreatePermissions) {
                    return this._cacheService.postArm(`${this._siteId}/config/appsettings/list`, true)
                        .map(r => {
                            res.appSettings = r.json();
                            return res;
                        });
                }
                return Observable.of(res);
            })
            .do(null, e => {
                // log error & clear busy state
                this._logService.error(LogCategories.newSlot, '/slot-new', e);
                this._globalStateService.clearBusyState();
            })
            .subscribe(res => {
                this._siteObj = <ArmObj<Site>>res.siteInfo.json();
                const sku = this._siteObj.properties.sku;
                this._slotsList = <ArmObj<Site>[]>res.slotsList;
                this.slotOptinEnabled = res.slotsList.length > 0 ||
                    res.appSettings.properties[Constants.slotsSecretStorageSettingsName] === Constants.slotsSecretStorageSettingsValue;
                this.hasReachedDynamicQuotaLimit = !!sku && sku.toLowerCase() === 'dynamic' && this._slotsList.length === 1;
                this._globalStateService.clearBusyState();
                this.isLoading = false;
            });
    }

    onFunctionAppSettingsClicked() {
        const appNode = <AppNode>this._slotsNode.parent;
        appNode.openSettings();
    }

    createSlot() {
        const newSlotName = this.newSlotForm.controls['name'].value;
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
