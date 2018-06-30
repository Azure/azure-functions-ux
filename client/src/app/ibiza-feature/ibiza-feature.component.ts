import { BusyStateScopeManager } from './../busy-state/busy-state-scope-manager';
import { Subject } from 'rxjs/Subject';
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

    @ViewChild(BusyStateComponent) busyStateComponent: BusyStateComponent;

    private _ngUnsubscribe = new Subject();
    private _busyManager: BusyStateScopeManager;

    constructor(private _userService: UserService) {
    }

    ngAfterViewInit() {
        this._userService
            .getStartupInfo()
            .first()
            .subscribe(info => {
                this.ready = true;
            });
    }

    ngOnDestroy() {
        this._ngUnsubscribe.next();
        this._busyManager.clearBusy();
    }
}
