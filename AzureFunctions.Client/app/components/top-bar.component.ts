import {Component, OnInit, EventEmitter, Input} from 'angular2/core';
import {UserService} from '../services/user.service';
import {User} from '../models/user';
import {TenantInfo} from '../models/tenant-info';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';
import {PortalService} from '../services/portal.service';
import {TutorialEvent, TutorialStep} from '../models/tutorial';

@Component({
    selector: 'top-bar',
    templateUrl: 'templates/top-bar.component.html',
    styleUrls: ['styles/top-bar.style.css'],
    inputs: ['isFunctionSelected'],
    outputs: ['appSettingsClicked', 'appMonitoringClicked']
})
export class TopBarComponent implements OnInit {
    @Input() gettingStarted: boolean;
    public user: User;
    public tenants: TenantInfo[];
    public currentTenant: TenantInfo;
    public inIFrame: boolean;
    public isAppMonitoringSelected: boolean;
    public isAppSettingSelected: boolean;
    private _isFunctionSelected: boolean;
    private appMonitoringClicked: EventEmitter<any>;
    private appSettingsClicked: EventEmitter<any>;

    constructor(private _userService: UserService,
                private _broadcastService: IBroadcastService,
                private _portalService: PortalService) {

        this.appMonitoringClicked = new EventEmitter<any>();
        this.appSettingsClicked = new EventEmitter<any>();
        this.inIFrame = this._userService.inIFrame;

        this._broadcastService.subscribe<TutorialEvent>(BroadcastEvent.TutorialStep, event => {
            if (event && event.step === TutorialStep.AppSettings) {
                this.onAppSettingsClicked();
            }
        });
    }

    ngOnInit() {
        // nothing to do if we're running in an iframe
        if (this.inIFrame) return;

        this._userService.getUser()
            .subscribe((u) => {
                this.user = u
            });

        this._userService.getTenants()
            .subscribe(t => {
                this.tenants = t;
                this.currentTenant = this.tenants.find(e => e.Current);
            });
    }

    selectTenant(tenant: TenantInfo) {
        window.location.href = `api/switchtenants/${tenant.TenantId}`;
    }

    onAppMonitoringClicked() {
        this.appMonitoringClicked.emit(null);
        this.isAppMonitoringSelected = true;
        this.isAppSettingSelected = false;
    }

    onAppSettingsClicked() {
        this.appSettingsClicked.emit(null);
        this.isAppSettingSelected = true;
        this.isAppMonitoringSelected = false;
    }

    set isFunctionSelected(selected: boolean) {
        this._isFunctionSelected = selected;
        this.isAppSettingSelected = selected ? false : this.isAppSettingSelected;
        this.isAppMonitoringSelected = selected ? false : this.isAppMonitoringSelected;
    }

    get isFunctionSelected() {
        return this._isFunctionSelected;
    }

    onAzureFunctionClick() {
        this._portalService.logAction('top-bar-azure-functions-link', 'click');
        this._broadcastService.broadcast(BroadcastEvent.GoToIntro);
    }
}