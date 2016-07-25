import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {UserService} from '../services/user.service';
import {User} from '../models/user';
import {TenantInfo} from '../models/tenant-info';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {PortalService} from '../services/portal.service';
import {TutorialEvent, TutorialStep} from '../models/tutorial';
import {FunctionsService} from '../services/functions.service';
import {Constants} from '../models/constants';
import {GlobalStateService} from '../services/global-state.service';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';

enum TopbarButton {
    None = <any>"None",
    AppMonitoring = <any>"AppMonitoring",
    AppSettings = <any>"AppSettings",
    Quickstart = <any>"Quickstart",
    SourceControl = <any>"SourceControl"
}

@Component({
    selector: 'top-bar',
    templateUrl: 'templates/top-bar.component.html',
    styleUrls: ['styles/top-bar.style.css'],
    inputs: ['isFunctionSelected', 'quickStartSelected'],
    pipes: [TranslatePipe]
})

export class TopBarComponent implements OnInit {
    @Input() gettingStarted: boolean;
    public user: User;
    public tenants: TenantInfo[];
    public currentTenant: TenantInfo;
    public inIFrame: boolean;
    public ActiveButton: TopbarButton;
    public needUpdateExtensionVersion;
    private _isFunctionSelected: boolean;
    private showTryView; boolean;

    @Output() private appMonitoringClicked: EventEmitter<any>;
    @Output() private appSettingsClicked: EventEmitter<any>;
    @Output() private quickstartClicked: EventEmitter<any>;
    @Output() private sourceControlClicked: EventEmitter<any>;

    constructor(private _userService: UserService,
        private _broadcastService: BroadcastService,
        private _portalService: PortalService,
        private _functionsService: FunctionsService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService
    ) {
        this.appMonitoringClicked = new EventEmitter<any>();
        this.appSettingsClicked = new EventEmitter<any>();
        this.quickstartClicked = new EventEmitter<any>();
        this.sourceControlClicked = new EventEmitter<any>();
        this.inIFrame = this._userService.inIFrame;

        this._broadcastService.subscribe<TutorialEvent>(BroadcastEvent.TutorialStep, event => {
            if (event && event.step === TutorialStep.AppSettings) {
                this.onAppSettingsClicked();
            }
        });

        this._broadcastService.subscribe(BroadcastEvent.VersionUpdated, event => {
            this.setInfo();
        });
    }

    ngOnInit() {
        this.showTryView = this._globalStateService.showTryView;
        if (!this.showTryView) {
            this.ActiveButton = TopbarButton.Quickstart;

            // nothing to do if we're running in an iframe
            if (this.inIFrame) return;

            this._userService.getUser()
                .subscribe((u) => {
                    this.user = u;
                });

            this._userService.getTenants()
                .subscribe(t => {
                    this.tenants = t;
                    this.currentTenant = this.tenants.find(e => e.Current);
                });
        } else
            this.ActiveButton = TopbarButton.None;
    }

    selectTenant(tenant: TenantInfo) {
        window.location.href = `api/switchtenants/${tenant.TenantId}`;
    }

    onAppMonitoringClicked() {
        if (this.canLeaveFunction()) {
            this.resetView();
            this.appMonitoringClicked.emit(null);
            this.ActiveButton = TopbarButton.AppMonitoring;
        }
    }

    onAppSettingsClicked() {
        if (this.canLeaveFunction()) {
            this.resetView();
            this.appSettingsClicked.emit(null);
            this.ActiveButton = TopbarButton.AppSettings;
        }
    }

    onQuickstartClicked() {
        if (this.canLeaveFunction()) {
            this._portalService.logAction('top-bar-azure-functions-link', 'click');
            this.resetView();
            this.quickstartClicked.emit(null);
            this.ActiveButton = TopbarButton.Quickstart;
        }
    }

    set isFunctionSelected(selected: boolean) {
        this.ActiveButton = TopbarButton.None;
        this._isFunctionSelected = true;
    }

    set quickStartSelected(selected: boolean) {
        if (selected) {
            this.ActiveButton = TopbarButton.Quickstart;
        }
    }

    get isFunctionSelected() {
        return this._isFunctionSelected;
    }

    private resetView() {
        this.ActiveButton = TopbarButton.None;
    }

    private setInfo() {
        this.needUpdateExtensionVersion = !this._globalStateService.IsLatest;
    }

    onSourceControlClicked() {
        if (this.canLeaveFunction()) {
            this._portalService.logAction('top-bar-source-control-link', 'click');
            this.resetView();
            this.sourceControlClicked.emit(null);
            this.ActiveButton = TopbarButton.SourceControl;
        }
    }

    // TODO: Remove duplicated code between here and SitebarComponent
    private canLeaveFunction() {
        var leaveFunction = true;
        if (this.isFunctionSelected &&
            (this._broadcastService.getDirtyState('function') || this._broadcastService.getDirtyState('function_integrate'))) {
            leaveFunction = confirm(this._translateService.instant(PortalResources.topBar_changeMade));
            if (leaveFunction) {
                this._broadcastService.clearDirtyState('function', true);
                this._broadcastService.clearDirtyState('function_integrate', true);
            }
        }
        return leaveFunction;
    }
}