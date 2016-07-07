import {Component, OnInit, EventEmitter, OnDestroy, Output} from '@angular/core';
import {FunctionsService} from '.././services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {FunctionConfig} from '../models/function-config';
import {VfsObject} from '../models/vfs-object';
import {Observable, Subscription, Subject} from 'rxjs/Rx';
import {UserService} from '../services/user.service';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {SideBarFilterPipe} from '../pipes/sidebar.pipe';
import {TutorialEvent, TutorialStep} from '../models/tutorial';
import {TryNowComponent} from './try-now.component';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';

@Component({
    selector: 'sidebar',
    templateUrl: 'templates/sidebar.component.html',
    styleUrls: ['styles/sidebar.style.css'],
    inputs: ['functionsInfo'],
    pipes: [SideBarFilterPipe, TranslatePipe],
    directives: [TryNowComponent]
})
export class SideBarComponent implements OnDestroy {
    public functionsInfo: FunctionInfo[];
    public selectedFunction: FunctionInfo;
    public inIFrame: boolean;
    public tryItNowTenant: boolean;
    public pullForStatus = false;
    public running: boolean;
    public dots = "";

    //TODO: move to constants since it is being used in other compenents as well
    private tryAppServiceTenantId: string = "6224bcc1-1690-4d04-b905-92265f948dad";
    @Output()
    refreshClicked = new EventEmitter<void>();
    private subscriptions: Subscription[];

    constructor(private _functionsService: FunctionsService,
        private _userService: UserService,
        private _broadcastService: BroadcastService,
        private _translateService: TranslateService) {

        this.subscriptions = [];
        this.inIFrame = this._userService.inIFrame;
        this.tryItNowTenant = false;

        this.subscriptions.push(this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionDeleted, fi => {
            if (this.selectedFunction.name === fi.name) delete this.selectedFunction;
            for (var i = 0; i < this.functionsInfo.length; i++) {
                if (this.functionsInfo[i].name === fi.name) {
                    this.functionsInfo.splice(i, 1);
                    break;
                }
            }
        }));

        this.subscriptions.push(this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionAdded, fi => {
            this.functionsInfo.push(fi);
            this.functionsInfo.sort((f1, f2) => {
                if (f1.name === this._translateService.instant("sideBar_newFunction") ) {
                    return -1;
                }
                if (f2.name === this._translateService.instant("sideBar_newFunction") ) {
                    return 1;
                }

                return f1.name > f2.name ? 1 : -1;
            });
            this.selectFunction(fi);
        }));

        this._broadcastService.subscribe<TutorialEvent>(BroadcastEvent.TutorialStep, (event) => {
            if (event && event.step === TutorialStep.NextSteps) {
                let selectedFi = this.functionsInfo.find(fi => fi === event.functionInfo);
                this.selectFunction(selectedFi);
            }
        });

         this._userService.getTenants()
            .subscribe(tenants => {
                 this.tryItNowTenant = tenants.some(e => e.Current && e.TenantId.toLocaleLowerCase() === this.tryAppServiceTenantId)
             });

    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    selectFunction(fi: FunctionInfo) {
        if (this.switchFunctions()) {
            this._broadcastService.clearDirtyState('function', true);
            this._broadcastService.clearDirtyState('function_integrate', true);
            this.selectedFunction = fi;
            this._broadcastService.broadcast(BroadcastEvent.FunctionSelected, fi);
        }
    }

    refresh() {
        if (this.switchFunctions()) {
            this.refreshClicked.emit(null);
        }
    }

    private switchFunctions() {
        var switchFunction = true;
        if ((this._broadcastService.getDirtyState('function') || this._broadcastService.getDirtyState('function_integrate')) && this.selectedFunction) {
            switchFunction = confirm(this._translateService.instant("sideBar_changeMade", { name: this.selectedFunction.name}));
        }
        return switchFunction;
    }

}