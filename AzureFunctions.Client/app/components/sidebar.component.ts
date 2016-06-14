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
import {UIResource} from '../models/ui-resource';

@Component({
    selector: 'sidebar',
    templateUrl: 'templates/sidebar.component.html',
    styleUrls: ['styles/sidebar.style.css'],
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
    public endTime: Date;
    public dots = "";
    public uiResource: UIResource;
    public isExtended: boolean;
    public trialExpired: boolean;
    //TODO: move to constants since it is being used in other compenents as well
    private tryAppServiceTenantId: string = "6224bcc1-1690-4d04-b905-92265f948dad";
    @Output()
    refreshClicked = new EventEmitter<void>();
    private subscriptions: Subscription[];

    constructor(private _functionsService: FunctionsService,
        private _userService: UserService,
        private _broadcastService: BroadcastService) {

        this.subscriptions = [];
        this.inIFrame = this._userService.inIFrame;
        this.tryItNowTenant = false;
        this.trialExpired = false;
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
            if (event && event.step === TutorialStep.NextSteps) {
                let selectedFi = this.functionsInfo.find(fi => fi === event.functionInfo);
                this.selectFunction(selectedFi);
            }
        });
        var callBack = () => {
            window.setTimeout(() => {

                     var element, hours, mins;
                     element = document.getElementById('countdownTimer');
                     var now_utc = this.getUTCDate();

                     var msLeft = this.endTime.getTime() - now_utc.getTime() ;

                     if (this.endTime >= now_utc) {

                         var time = new Date(msLeft);
                         hours = time.getUTCHours();
                         mins = time.getUTCMinutes();
                         element.innerHTML = (hours ? this.pad(hours, 2) + ':' + this.pad(mins, 2) : mins) + ':' + this.pad(time.getUTCSeconds(),2);
                         window.setTimeout(callBack, 500);
                     } else {
                         element.innerHTML = "Trial expired";
                         this.trialExpired = true;
                         this._broadcastService.broadcast(BroadcastEvent.TrialExpired);
                     }
                });


        };
         this._userService.getTenants()
            .subscribe(tenants => {
                this.tryItNowTenant = tenants.some(e => e.Current && e.TenantId.toLocaleLowerCase() === this.tryAppServiceTenantId);
                if (this.tryItNowTenant)
                    this._functionsService.getTrialResource()
                        .subscribe((resource) => {
                            this.uiResource = resource;
                            this.isExtended = resource.isExtended;
                            this.endTime = this.getUTCDate();
                            this.endTime.setUTCSeconds(this.endTime.getUTCSeconds() + resource.timeLeft);
                            callBack();
                        });
            });
    }

    getUTCDate() {
        var now = new Date;
        return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

    }

    //http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
    pad(n, width) {
    var z = '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

    redirecttoazurefreetrial() {
        window.location.replace(`${window.location.protocol}//azure.microsoft.com/${window.navigator.language}/free`);
    }

    extendResourceLifeTime() {
        this.running = true;
        this._functionsService.extendTrialResource().
            subscribe((resource) => {
                this.uiResource = resource;
                this.isExtended = resource.isExtended;
                this.endTime = this.getUTCDate();
                this.endTime.setUTCSeconds(this.endTime.getUTCSeconds() + resource.timeLeft);
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
            switchFunction = confirm(`Changes made to function ${this.selectedFunction.name} will be lost. Are you sure you want to continue?`);
        }
        return switchFunction;
    }

}