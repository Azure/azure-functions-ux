import {Component, OnInit, EventEmitter, ViewChild, Input} from '@angular/core';
import {FunctionsService} from '../shared/services/functions.service';
import {FunctionApp} from '../shared/function-app';
import {PortalService} from '../shared/services/portal.service';
import {UserService} from '../shared/services/user.service';
import {FunctionInfo} from '../shared/models/function-info';
import {VfsObject} from '../shared/models/vfs-object';
import {FunctionDevComponent} from '../function-dev/function-dev.component';
import {FunctionConfig} from '../shared/models/function-config';
import {Observable, Subject} from 'rxjs/Rx';
import {FunctionSecrets} from '../shared/models/function-secrets';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event'
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {TutorialEvent, TutorialStep} from '../shared/models/tutorial';
import {TreeViewInfo} from '../tree-view/models/tree-view-info';
import {FunctionNode} from '../tree-view/function-node';

@Component({
    selector: 'function-edit',
    templateUrl: './function-edit.component.html',
    styleUrls: ['./function-edit.component.css'],
    inputs: ['viewInfoInput']
})
export class FunctionEditComponent {

    @ViewChild(FunctionDevComponent) functionDevComponent: FunctionDevComponent;
    public selectedFunction: FunctionInfo;
    public viewInfo : TreeViewInfo;
    public inIFrame: boolean;
    public editorType: string = "standard";
    public disabled: boolean;

    public DevelopTab: string;
    public IntegrateTab: string;
    public MonitorTab: string;
    public ManageTab: string;
    public tabId: string = "";

    private _viewInfoStream : Subject<TreeViewInfo>;

    constructor(
        private _userService: UserService,
        private _broadcastService: BroadcastService,
        private _portalService: PortalService,
        private _translateService: TranslateService) {
        this.inIFrame = this._userService.inIFrame;

        this.DevelopTab = _translateService.instant("tabNames_develop");
        this.IntegrateTab = _translateService.instant("tabNames_integrate");
        this.MonitorTab = _translateService.instant("tabNames_monitor");
        this.ManageTab = _translateService.instant("tabNames_manage");

        this._viewInfoStream = new Subject<TreeViewInfo>();
        this._viewInfoStream
            .distinctUntilChanged()
            .switchMap(viewInfo =>{
                this.viewInfo = viewInfo;
                this.selectedFunction = (<FunctionNode>viewInfo.node).functionInfo;

                let segments = viewInfo.resourceId.split("/");
                if (segments.length === 11) {
                    this.tabId = "develop";
                } else {
                    this.tabId = segments[segments.length - 1];
                }

                return this.selectedFunction.functionApp.checkIfDisabled();
            })
            .subscribe(disabled =>{
                this.disabled = disabled;
            })
    }

    set viewInfoInput(viewInfo : TreeViewInfo){
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
        this._portalService.logAction("function-edit", "switchEditor", { type: editorType });
        this.editorType = editorType;
    }
}