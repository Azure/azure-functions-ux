import {Component, OnInit, EventEmitter, OnDestroy, Output} from '@angular/core';
import { TimerAppComponent } from "./timer";
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
    public timeRemaining: string;
    public dots = "";
    public  uiResource: UIResource;
    @Output()
    refreshClicked = new EventEmitter<void>();
    private subscriptions: Subscription[];

    constructor(private _functionsService: FunctionsService,
        private _userService: UserService,
        private _broadcastService: BroadcastService) {

        this.subscriptions = [];
        this.inIFrame = this._userService.inIFrame;
        this.tryItNowTenant = true;
        this.timeRemaining = "00:00:00";
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

        this._functionsService.getTrialResource()
            .subscribe((resource) => {
                    this.uiResource = resource;
                    this.startCountDown(resource.timeLeft);
                } )
            ;
    }
    
    timerCallback() {
        // this.$apply(() => siteExpired = true);
    }

    redirecttoazurefreetrial() {
        window.location.replace(`${window.location.protocol}//azure.microsoft.com/${window.navigator.language}/free`);
    }

    extendResourceLifeTime() {
        this.running = true;
        this._functionsService.extendTrialResource().
            subscribe((r) => {
                this.uiResource = r;
                this.startCountDown(r.timeLeft);
            });

    }

    startCountDown(timeLeft) {
        this.timeRemaining = timeLeft.toString();
        this.countdown("countdownTimer", 59, 0);
        //$scope.$broadcast("timer-set-c"ountdown-seconds", timeLeft);
        //$scope.$broadcast("timer-set-countdown", timeLeft);
        //$scope.$broadcast("timer-start");

    }

    countdown(elementName, minutes, seconds) {
        var element, endTime; 
               element = document.getElementById(elementName);
            endTime = (+new Date) + 1000 * (60 * minutes + seconds) + 500;
            this.updateTimer(endTime, element);
        }

    twoDigits(n) {
    return (n <= 9 ? "0" + n : n);
}
    updateTimer(endTime, element) {
        var hours, mins, msLeft, time;
          msLeft = endTime - (+new Date);
        if (msLeft < 1000) {
            element.innerHTML = "countdown's over!";
        } else {
            time = new Date(msLeft);
            hours = time.getUTCHours();
            mins = time.getUTCMinutes();
            element.innerHTML = (hours ? hours + ':' + this.twoDigits(mins) : mins) + ':' + this.twoDigits(time.getUTCSeconds());
            setTimeout(this.updateTimer, time.getUTCMilliseconds() + 500);
        }
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