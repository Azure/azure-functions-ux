import {Component, OnInit, EventEmitter} from '@angular/core';
import {FunctionsService} from '../services/functions.service';
import {PortalService} from '../services/portal.service';
import {UserService} from '../services/user.service';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {AceEditorDirective} from '../directives/ace-editor.directive';
import {FunctionDesignerComponent} from './function-designer.component';
import {LogStreamingComponent} from './log-streaming.component';
import {FunctionDevComponent} from './function-dev.component';
import {FunctionIntegrateComponent} from './function-integrate.component';
import {FunctionConfig} from '../models/function-config';
import {Observable, Subject} from 'rxjs/Rx';
import {FunctionSecrets} from '../models/function-secrets';
import {TabsComponent} from './tabs.component';
import {TabComponent} from './tab.component';
import {FunctionManageComponent} from './function-manage.component';
import {FunctionIntegrateV2Component} from './function-integrate-v2.component';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {FunctionMonitorComponent} from './function-monitor.component'
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';

@Component({
    selector: 'function-edit',
    templateUrl: 'templates/function-edit.component.html',
    styleUrls: ['styles/function-edit.style.css'],
    inputs: ['selectedFunction'],
    directives: [
        FunctionDevComponent,
        FunctionIntegrateComponent,
        AceEditorDirective,
        FunctionDesignerComponent,
        LogStreamingComponent,
        TabsComponent,
        TabComponent,
        FunctionManageComponent,
        FunctionIntegrateV2Component,
        FunctionMonitorComponent
    ],
    pipes: [TranslatePipe]
})
export class FunctionEditComponent {
    public selectedFunction: FunctionInfo;
    public inIFrame: boolean;
    public selectedTabTitle: string = "";
    public editorType: string = "standard";
    public disabled: boolean;

    public DevelopTab: string;
    public IntegrateTab: string;
    public MonitorTab: string;
    public ManageTab: string;

    constructor(
        private _functionsService: FunctionsService,
        private _userService: UserService,
        private _broadcastService: BroadcastService,
        private _portalService: PortalService,
        private _translateService: TranslateService) {

        this.inIFrame = this._userService.inIFrame;

        this.disabled = _broadcastService.getDirtyState("function_disabled");

        this.DevelopTab = _translateService.instant("tabNames_develop");
        this.IntegrateTab = _translateService.instant("tabNames_integrate");
        this.MonitorTab = _translateService.instant("tabNames_manage");
        this.ManageTab = _translateService.instant("tabNames_monitor");
    }

    onTabSelected(selectedTab: TabComponent) {
        this.selectedTabTitle = selectedTab.title;
    }

    onEditorChange(editorType: string) {
        this._portalService.logAction("function-edit", "switchEditor", { type: editorType });
        this.editorType = editorType;
    }
}