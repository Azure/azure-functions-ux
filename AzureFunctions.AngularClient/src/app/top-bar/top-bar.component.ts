import { ConfigService } from './../shared/services/config.service';
import { TopBarNotification } from './top-bar-models';
import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../shared/services/user.service';
import { User } from '../shared/models/user';
import { TenantInfo } from '../shared/models/tenant-info';
import { Constants } from '../shared/models/constants';
import { GlobalStateService } from '../shared/services/global-state.service';
import { SiteDescriptor, Descriptor, FunctionDescriptor } from '../shared/resourceDescriptors';

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
    public inTab: boolean;
    public isStandalone: boolean;
    // public needUpdateExtensionVersion;

    public visible = false;
    public topBarNotifications: TopBarNotification[] = [];

    public resourceId: string;
    public appName: string;
    public fnName: string;

    // @Output() private functionAppSettingsClicked: EventEmitter<any>;

    constructor(private _userService: UserService,
        private _globalStateService: GlobalStateService,
        private _configService: ConfigService
    ) {
        // this.functionAppSettingsClicked = new EventEmitter<any>();
        this.inIFrame = this._userService.inIFrame;
        this.inTab = this._userService.inTab;
        this.isStandalone = this._configService.isStandalone();

        if (this.inTab) {
            _userService.getStartupInfo()
                .first()
                .subscribe(info => {
                    this.resourceId = info.resourceId;
                    const descriptor = <SiteDescriptor>Descriptor.getDescriptor(this.resourceId);
                    this.appName = descriptor.site;
                    const fnDescriptor = new FunctionDescriptor(this.resourceId);
                    this.fnName = fnDescriptor.functionName;
                });
        }

        this._globalStateService.topBarNotificationsStream
            .subscribe(topBarNotifications => {
                this.topBarNotifications = topBarNotifications;
                this._setVisible();
            });

        this._setVisible();

        // this._broadcastService.subscribe(BroadcastEvent.VersionUpdated, event => {
        // this.needUpdateExtensionVersion = !this._globalStateService.IsLatest;
        // this.setVisible();
        // });
    }

    public get showTryView() {
        return this._globalStateService.showTryView;
    }

    private _setVisible() {
        if (this.inIFrame) {
            this.visible = this.topBarNotifications && this.topBarNotifications.length > 0;
        }
        else if (!this._globalStateService.showTryView) {
            this.visible = true;
        }
    }

    ngOnInit() {
        this._globalStateService.showTryView = this._globalStateService.showTryView;
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

    notificationClick(notification: TopBarNotification) {
        if (notification.clickCallback) {
            notification.clickCallback();
        }
    }
}
