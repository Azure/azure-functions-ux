import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { AppNode } from './../tree-view/app-node';
import { Component, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/switchMap';
import { TranslateService } from '@ngx-translate/core';
import { FunctionApp } from '../shared/function-app';
import { PortalService } from '../shared/services/portal.service';
import { UserService } from '../shared/services/user.service';
import { FunctionInfo } from '../shared/models/function-info';
import { FunctionDevComponent } from '../function-dev/function-dev.component';
import { BroadcastService } from '../shared/services/broadcast.service';
import { TreeViewInfo } from '../tree-view/models/tree-view-info';
import { FunctionNode } from '../tree-view/function-node';

@Component({
    selector: 'function-edit',
    templateUrl: './function-edit.component.html',
    styleUrls: ['./function-edit.component.css'],
})
export class FunctionEditComponent implements OnDestroy {

    @ViewChild(FunctionDevComponent) functionDevComponent: FunctionDevComponent;
    public selectedFunction: FunctionInfo;
    public viewInfo: TreeViewInfo<any>;
    public inIFrame: boolean;
    public editorType = "standard";
    public disabled: boolean;

    public DevelopTab: string;
    public IntegrateTab: string;
    public MonitorTab: string;
    public ManageTab: string;
    public tabId = '';

    private _viewInfoStream: Subject<TreeViewInfo<any>>;
    private _ngUnsubscribe = new Subject<void>();

    private appNode: AppNode;
    private functionApp: FunctionApp;

    constructor(
        private _userService: UserService,
        private _broadcastService: BroadcastService,
        private _portalService: PortalService,
        _translateService: TranslateService) {

        this.inIFrame = this._userService.inIFrame;

        this.DevelopTab = _translateService.instant('tabNames_develop');
        this.IntegrateTab = _translateService.instant('tabNames_integrate');
        this.MonitorTab = _translateService.instant('tabNames_monitor');
        this.ManageTab = _translateService.instant('tabNames_manage');

        this._viewInfoStream = new Subject<TreeViewInfo<any>>();
        this._viewInfoStream
            .takeUntil(this._ngUnsubscribe)
            .subscribe(viewInfo => {
                this.viewInfo = viewInfo;
                this.selectedFunction = (<FunctionNode>viewInfo.node).functionInfo;
                this.functionApp = this.selectedFunction.functionApp;
                this.appNode = <AppNode>viewInfo.node.parent.parent;
                const segments = viewInfo.resourceId.split('/');
                // support for both site & slots
                if (segments.length === 13 && segments[11] === 'functions' || segments.length === 11 && segments[9] === 'functions') {
                    this.tabId = 'develop';
                } else {
                    this.tabId = segments[segments.length - 1];
                }
            });

        this._broadcastService.getEvents<TreeViewInfo<any>>(BroadcastEvent.FunctionDashboard)
            .takeUntil(this._ngUnsubscribe)
            .subscribe(info => {
                this._viewInfoStream.next(info);
            });

        this._broadcastService.getEvents<TreeViewInfo<any>>(BroadcastEvent.FunctionIntegrateDashboard)
            .takeUntil(this._ngUnsubscribe)
            .subscribe(info => {
                this._viewInfoStream.next(info);
            });

        this._broadcastService.getEvents<TreeViewInfo<any>>(BroadcastEvent.FunctionManageDashboard)
            .takeUntil(this._ngUnsubscribe)
            .subscribe(info => {
                this._viewInfoStream.next(info);
            });

        this._broadcastService.getEvents<TreeViewInfo<any>>(BroadcastEvent.FunctionMonitorDashboard)
            .takeUntil(this._ngUnsubscribe)
            .subscribe(info => {
                this._viewInfoStream.next(info);
            });
    }

    ngOnDestroy() {
        this._ngUnsubscribe.next();
    }

    onEditorChange(editorType: string) {
        this._portalService.logAction('function-edit', 'switchEditor', { type: editorType });
        this.editorType = editorType;
    }
}
