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
    outputs: ['appSettingsClicked', 'appMonitoringClicked', 'quickstartClicked']
})
export class TopBarComponent implements OnInit {
    @Input() gettingStarted: boolean;
    public user: User;
    public tenants: TenantInfo[];
    public currentTenant: TenantInfo;
    public inIFrame: boolean;
    public isAppMonitoringSelected: boolean;
    public isAppSettingSelected: boolean;
    public isQuickstartSelected: boolean;
    private _isFunctionSelected: boolean;
    private appMonitoringClicked: EventEmitter<any>;
    private appSettingsClicked: EventEmitter<any>;
    private quickstartClicked: EventEmitter<any>;

    constructor(private _userService: UserService,
                private _broadcastService: IBroadcastService,
                private _portalService: PortalService) {

        this.appMonitoringClicked = new EventEmitter<any>();
        this.appSettingsClicked = new EventEmitter<any>();
        this.quickstartClicked = new EventEmitter<any>();
        this.inIFrame = this._userService.inIFrame;

        this._broadcastService.subscribe<TutorialEvent>(BroadcastEvent.TutorialStep, event => {
            if (event && event.step === TutorialStep.AppSettings) {
                this.onAppSettingsClicked();
            }
        });
    }

    ngOnInit() {
        this.isQuickstartSelected = true;

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
        this.resetView();
        this.appMonitoringClicked.emit(null);
        this.isAppMonitoringSelected = true;
    }

    onAppSettingsClicked() {
        this.resetView();
        this.appSettingsClicked.emit(null);
        this.isAppSettingSelected = true;
    }

    onQuickstartClicked() {
        this._portalService.logAction('top-bar-azure-functions-link', 'click');
        this.resetView();
        this.quickstartClicked.emit(null);
        this.isQuickstartSelected = true;
    }

    set isFunctionSelected(selected: boolean) {
        this._isFunctionSelected = selected;
        this.isAppSettingSelected = selected ? false : this.isAppSettingSelected;
        this.isAppMonitoringSelected = selected ? false : this.isAppMonitoringSelected;
        this.isQuickstartSelected = selected ? false : this.isQuickstartSelected;
    }

    get isFunctionSelected() {
        return this._isFunctionSelected;
    }
    
    private resetView(){
        this.isAppMonitoringSelected = false;
        this.isAppSettingSelected = false;
        this.isQuickstartSelected = false;
    }
}