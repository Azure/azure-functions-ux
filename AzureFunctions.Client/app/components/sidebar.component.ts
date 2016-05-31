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

@Component({
    selector: 'sidebar',
    templateUrl: 'templates/sidebar.component.html',
    styleUrls: [ 'styles/sidebar.style.css' ],
    inputs: ['functionsInfo'],
    pipes: [SideBarFilterPipe]
})
export class SideBarComponent implements OnDestroy {
    public functionsInfo: FunctionInfo[];
    public selectedFunction: FunctionInfo;
    public inIFrame: boolean;
    public tryItNowTenant: boolean;
    public pullForStatus = false;
    public running: boolean;
    public dots = "";
    @Output() refreshClicked = new EventEmitter<void>();
    private subscriptions: Subscription[];

    constructor(private _functionsService: FunctionsService,
                private _userService: UserService,
                private _broadcastService: BroadcastService) {

        this.subscriptions = [];
        this.inIFrame = this._userService.inIFrame;
        this.tryItNowTenant = true;
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
                if (f1.name === "New Function") {
                    return -1;
                }
                if (f2.name === "New Function") {
                    return 1;
                }

                return f1.name > f2.name ? 1 : -1;
            });
            this.selectFunction(fi);
        }));

        this._broadcastService.subscribe<TutorialEvent>(BroadcastEvent.TutorialStep, (event) => {
            if(event && event.step === TutorialStep.NextSteps){
                let selectedFi = this.functionsInfo.find(fi => fi === event.functionInfo);
                this.selectFunction(selectedFi);
            }
        });
    }

    timerCallback(){
      // this.$apply(() => siteExpired = true);
    }

    redirecttoazurefreetrial() {
        window.location.replace(`${window.location.protocol}//azure.microsoft.com/${window.navigator.language}/free`);
    }

    extendResourceLifeTime (){
        this.running = true;
/*        $http({
            url: "api/resource/extend",
            method: "POST"
        }).success((data: any) => {
            this.resource = data;
            startCountDown(data.timeLeft);
        }).error((e) => {
            this.ngModels.errorMessage = e.Message;
        }).finally(() => this.running = false);
    */
    }


startStatusPull() {
/*    if (this.pullForStatus) {
        $http
            .get("/api/resource/status")
            .success(d => {
                this.dots = (this.dots.length > 4 || this.ngModels.statusMessage !== d) ? "." : this.dots + ".";
                this.ngModels.statusMessage = d + this.dots;
                $timeout(this.startStatusPull, 5000);
            });
    } else {
        delete this.ngModels.statusMessage;
    }
    */
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
            switchFunction = confirm(`Changes made to function ${this.selectedFunction.name} will be lost. Are you sure you want to continue?`);
        }
        return switchFunction;
    }
}