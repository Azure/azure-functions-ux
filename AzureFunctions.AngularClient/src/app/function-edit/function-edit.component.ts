import { AppNode } from './../tree-view/app-node';
import { Component, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/switchMap';
import { TranslateService } from '@ngx-translate/core';

import { FunctionApp } from '../shared/function-app';
import { PortalService } from '../shared/services/portal.service';
import { UserService } from '../shared/services/user.service';
import { FunctionInfo } from '../shared/models/function-info';
import { FunctionDevComponent } from '../function-dev/function-dev.component';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event'
import { TutorialEvent, TutorialStep } from '../shared/models/tutorial';
import { TreeViewInfo } from '../tree-view/models/tree-view-info';
import { FunctionNode } from '../tree-view/function-node';

@Component({
    selector: 'function-edit',
    templateUrl: './function-edit.component.html',
    styleUrls: ['./function-edit.component.css'],
    inputs: ['viewInfoInput']
})
export class FunctionEditComponent {

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
    }

    set viewInfoInput(viewInfo: TreeViewInfo<any>) {
        this._viewInfoStream.next(viewInfo);
    }

    ngAfterContentInit() {
        this._broadcastService.broadcast<TutorialEvent>(
            BroadcastEvent.TutorialStep,
            {
                functionInfo: null,
                step: TutorialStep.Develop
            });
    }

    onEditorChange(editorType: string) {
        this._portalService.logAction('function-edit', 'switchEditor', { type: editorType });
        this.editorType = editorType;
    }
}
