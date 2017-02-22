import { TopBarNotification } from './top-bar-models';
import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {UserService} from '../shared/services/user.service';
import {User} from '../shared/models/user';
import {TenantInfo} from '../shared/models/tenant-info';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event'
import {PortalService} from '../shared/services/portal.service';
import {TutorialEvent, TutorialStep} from '../shared/models/tutorial';
import {FunctionsService} from '../shared/services/functions.service';
import {Constants} from '../shared/models/constants';
import {GlobalStateService} from '../shared/services/global-state.service';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../shared/models/portal-resources';

@Component({
  selector: 'top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  inputs: ['isFunctionSelected']
})
export class TopBarComponent implements OnInit {
    @Input() gettingStarted: boolean;
    public user: User;
    public tenants: TenantInfo[];
    public currentTenant: TenantInfo;
    public inIFrame: boolean;
    // public needUpdateExtensionVersion;
    private _isFunctionSelected: boolean;
    private showTryView; boolean;

    public visible = false;
    public topBarNotifications : TopBarNotification[] = [];

    // @Output() private functionAppSettingsClicked: EventEmitter<any>;

    constructor(private _userService: UserService,
        private _broadcastService: BroadcastService,
        private _portalService: PortalService,
        private _functionsService: FunctionsService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService
    ) {
        // this.functionAppSettingsClicked = new EventEmitter<any>();
        this.inIFrame = this._userService.inIFrame;

        this._globalStateService.topBarNotificationsStream
        .subscribe(topBarNotifications =>{
            this.topBarNotifications = topBarNotifications;
            this._setVisible();
        })

        this._setVisible();

        // this._broadcastService.subscribe(BroadcastEvent.VersionUpdated, event => {
            // this.needUpdateExtensionVersion = !this._globalStateService.IsLatest;
            // this.setVisible();
        // });
    }

    private _setVisible(){
        if(this.inIFrame){
            this.visible = this.topBarNotifications && this.topBarNotifications.length > 0;
        }
        else{
            this.visible = true;
        }
    }

    ngOnInit() {
        this.showTryView = this._globalStateService.showTryView;
        if (!this.showTryView) {

            // nothing to do if we're running in an iframe
            if (this.inIFrame) return;

            this._userService.getUser()
                .subscribe((u) => {
                    this.user = u;
                    // this.setVisible();
                });

            this._userService.getTenants()
                .subscribe(t => {
                    this.tenants = t;
                    this.currentTenant = this.tenants.find(e => e.Current);
                    // this.setVisible();
                });
        } else {
            // this.setVisible();
        }

    }

    selectTenant(tenant: TenantInfo) {
        window.location.href = Constants.serviceHost + `api/switchtenants/${tenant.TenantId}`;
    }

    notificationClick(notification : TopBarNotification){
        if(notification.clickCallback){
            notification.clickCallback();
        }
    }

    // set isFunctionSelected(selected: boolean) {
    //     this._isFunctionSelected = true;
    // }

    // get isFunctionSelected() {
    //     return this._isFunctionSelected;
    // }

    // private setVisible() {
    //     this._globalStateService.showTopbar = !this._globalStateService.isAlwaysOn || (this.showTryView && !this.gettingStarted)
    //         || this.needUpdateExtensionVersion || ((this.user && this.currentTenant && !this.inIFrame) ? true : false);
    // }

    // onFunctionAppSettingsClicked(event: any) {
    //     if (this.canLeaveFunction()) {
    //         this.functionAppSettingsClicked.emit(event);
    //     }
    // }

    // TODO: Remove duplicated code between here and SitebarComponent
    // private canLeaveFunction() {
    //     var leaveFunction = true;
    //     if (this.isFunctionSelected &&
    //         (this._broadcastService.getDirtyState('function') || this._broadcastService.getDirtyState('function_integrate'))) {
    //         leaveFunction = confirm(this._translateService.instant(PortalResources.topBar_changeMade));
    //         if (leaveFunction) {
    //             this._broadcastService.clearDirtyState('function', true);
    //             this._broadcastService.clearDirtyState('function_integrate', true);
    //         }
    //     }
    //     return leaveFunction;
    // }
}