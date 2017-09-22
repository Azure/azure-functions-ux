import { BusyStateScopeManager } from './../busy-state/busy-state-scope-manager';
import { Subject } from 'rxjs/Subject';
import { PortalService } from './../shared/services/portal.service';
import { FunctionApp } from './../shared/function-app';
import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { TreeViewInfo } from '../tree-view/models/tree-view-info';
import { UserService } from '../shared/services/user.service';
import { BusyStateComponent } from '../busy-state/busy-state.component';
import { FunctionInfo } from 'app/shared/models/function-info';

@Component({
    selector: 'app-ibiza-feature',
    templateUrl: './ibiza-feature.component.html',
    styleUrls: ['./ibiza-feature.component.scss']
})
export class IbizaFeatureComponent implements AfterViewInit, OnDestroy {
    public ready = false;
    public resourceId: string;
    public viewInfo: TreeViewInfo<any>;
    public dashboardType: string;
    public inIFrame: boolean;
    public inTab: boolean;
    public selectedFunction: FunctionInfo;
    public tryFunctionApp: FunctionApp;

    @ViewChild(BusyStateComponent) busyStateComponent: BusyStateComponent;

    private _ngUnsubscribe = new Subject();
    private _busyStateScopeManager: BusyStateScopeManager;

    constructor(
        private _userService: UserService,
        private _portalService: PortalService
    ) {
    }

    ngAfterViewInit() {
        this._userService
            .getStartupInfo()
            .first()
            .subscribe(info => {
                this.ready = true;

                this._portalService.sendTimerEvent({
                    timerId: 'PortalReady',
                    timerAction: 'stop'
                });
            });
    }

    ngOnDestroy() {
        this._ngUnsubscribe.next();
        this._busyStateScopeManager.dispose();
    }
}
