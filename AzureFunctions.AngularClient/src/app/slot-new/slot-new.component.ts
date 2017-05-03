import { Component, OnInit, Injector } from '@angular/core';
import { SlotsService } from "app/shared/services/slots.service";
import { SlotsNode } from "app/tree-view/slots-node";
import { Subject } from "rxjs/Subject";
import { TreeViewInfo } from "app/tree-view/models/tree-view-info";
import { GlobalStateService } from "app/shared/services/global-state.service";
import { Observable } from "rxjs/Observable";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { BroadcastService } from "app/shared/services/broadcast.service";
import { AiService } from "app/shared/services/ai.service";
import { CacheService } from "app/shared/services/cache.service";
import { ArmObj } from "app/shared/models/arm/arm-obj";
import { Site } from "app/shared/models/arm/site";
import { PortalService } from "app/shared/services/portal.service";
import { Constants } from "app/shared/models/constants";
import { AppNode } from "app/tree-view/app-node";
import { RequiredValidator } from "app/shared/validators/requiredValidator";
import { PortalResources } from "app/shared/models/portal-resources";
import { SlotNameValidator } from "app/shared/validators/slotNameValidator";
import { AppsNode } from "app/tree-view/apps-node";
import { BroadcastEvent } from "app/shared/models/broadcast-event";
import { ErrorIds } from "app/shared/models/error-ids";
import { ErrorType, ErrorEvent } from "app/shared/models/error-event";
import { AuthzService } from "app/shared/services/authz.service";

interface DataModel {
    writePermission: boolean,
    readOnlyLock: boolean,
    siteInfo: any,
    appSettings: any,
    slotsList: ArmObj<Site>[]
}

@Component({
    selector: 'slot-new',
    templateUrl: './slot-new.component.html',
    styleUrls: ['./slot-new.component.scss'],
    inputs: ['viewInfoInput']
})
export class SlotNewComponent implements OnInit {
    public Resources = PortalResources;
    public slotOptinEnabled: boolean;
    public hasCreatePermissions: boolean;
    public newSlotForm: FormGroup;
    public slotNamePlaceholder: string;

    private _slotsNode: SlotsNode;
    private _viewInfoStream = new Subject<TreeViewInfo>();
    private _viewInfo: TreeViewInfo;
    private _siteId: string;
    private _appSettings: any;
    private _slotsList: ArmObj<Site>[];
    private _siteObj: ArmObj<Site>;

    constructor(fb: FormBuilder,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _broadcastService: BroadcastService,
        private _portalService: PortalService,
        private _aiService: AiService,
        private _slotService: SlotsService,
        private _cacheService: CacheService,
        authZService: AuthzService,
        injector: Injector) {
        let validator = new RequiredValidator(this._translateService);

        this._viewInfoStream
            .switchMap(viewInfo => {
                this._globalStateService.setBusyState();
                this._slotsNode = <SlotsNode>viewInfo.node;
                this._viewInfo = viewInfo;
                // parse the site resourceId from slot's
                this._siteId = viewInfo.resourceId.substring(0, viewInfo.resourceId.indexOf("/slots"));
                let slotNameValidator = new SlotNameValidator(injector, this._siteId);
                this.newSlotForm = fb.group({
                    name: [null,
                        validator.validate.bind(validator),
                        slotNameValidator.validate.bind(slotNameValidator)]
                })

                return Observable.zip<DataModel>(
                    authZService.hasPermission(this._siteId, [AuthzService.writeScope]),
                    authZService.hasReadOnlyLock(this._siteId),
                    this._cacheService.getArm(this._siteId),
                    this._slotService.getSlotsList(this._siteId),
                    (w, rl, s, l) => ({
                        writePermission: w,
                        readOnlyLock: rl,
                        siteInfo: s,
                        slotsList: l
                    }))
            })
            .flatMap(res => {
                this.hasCreatePermissions = res.writePermission && !res.readOnlyLock;
                if (this.hasCreatePermissions) {
                    return this._cacheService.postArm(`${this._siteId}/config/appsettings/list`, true)
                        .map(r => {
                            res.appSettings = r.json()
                            return res
                        })
                }
                return Observable.of(res)
            })
            .do(null, e => {
                // log error & clear busy state
                this._aiService.trackException(e, '/errors/slot-new');
                this._globalStateService.clearBusyState();
            })
            .retry()
            .subscribe(res => {
                this._siteObj = <ArmObj<Site>>res.siteInfo.json();
                this._slotsList = <ArmObj<Site>[]>res.slotsList;
                this.slotOptinEnabled = res.slotsList.length > 0 ||
                    res.appSettings.properties[Constants.slotsSecretStorageSettingsName] === Constants.slotsSecretStorageSettingsValue
                this._globalStateService.clearBusyState();
            })
    }

    set viewInfoInput(viewInfoInput: TreeViewInfo) {
        this._viewInfoStream.next(viewInfoInput);
    }

    ngOnInit() {
    }

    onFunctionAppSettingsClicked(event: any) {
        let appNode = <AppNode>this._slotsNode.parent;
        appNode.openSettings();
    }

    createSlot() {
        let newSlotName = this.newSlotForm.controls['name'].value;
        let notificationId = null;
        this._globalStateService.setBusyState();
        // show create slot start notification
        this._portalService.startNotification(
            this._translateService.instant(PortalResources.slotNew_startCreateNotifyTitle).format(newSlotName),
            this._translateService.instant(PortalResources.slotNew_startCreateNotifyTitle).format(newSlotName))
            .first()
            .switchMap(s => {
                notificationId = s.id;
                return this._slotService.createNewSlot(this._siteObj.id, newSlotName, this._siteObj.location, this._siteObj.properties.serverFarmId)
            })
            .subscribe((r) => {
                this._globalStateService.clearBusyState();
                // update notification
                this._portalService.stopNotification(
                    notificationId,
                    true,
                    this._translateService.instant(PortalResources.slotNew_startCreateSuccessNotifyTitle).format(newSlotName));
                let slotsNode = <SlotsNode>this._viewInfo.node;
                slotsNode.addChild(<ArmObj<Site>>r.json());
            }, err => {
                this._globalStateService.clearBusyState();
                this._portalService.stopNotification(
                    notificationId,
                    false,
                    this._translateService.instant(PortalResources.slotNew_startCreateFailureNotifyTitle).format(newSlotName));
                this._broadcastService.broadcast<ErrorEvent>(
                    BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.slotNew_startCreateFailureNotifyTitle).format(newSlotName),
                        details: this._translateService.instant(PortalResources.slotNew_startCreateFailureNotifyTitle).format(newSlotName),
                        errorId: ErrorIds.failedToCreateSlot,
                        errorType: ErrorType.Fatal
                    });
                this._aiService.trackEvent(ErrorIds.failedToCreateApp, { error: err, id: this._siteObj.id });
            })
    }
}
