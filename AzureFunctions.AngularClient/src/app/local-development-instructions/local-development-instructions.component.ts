import {Component, OnInit, Inject, ElementRef} from '@angular/core';
import {FunctionsService} from '../shared/services/functions.service';
import {GlobalStateService} from '../shared/services/global-state.service';

@Component({
    selector: 'local-develop',
  templateUrl: './local-development-instructions.component.html',
  styleUrls: ['./local-development-instructions.component.css']
})
export class LocalDevelopmentInstructionsComponent implements OnInit {

    private shown: boolean = false;
    private selectedMode: string = 'Azure';
    private isLocalServerRunning: boolean = false;
    private downloadUrl: string;
    constructor(
        private _globalStateService: GlobalStateService,
        private _functionsService: FunctionsService) {
    }

    ngOnInit() {
    }

    show() {
        this.shown = true;
        this.downloadUrl = `${this._functionsService.getScmUrl()}/api/zip/site/ng2app`;
        this.checkLocalFunctionsServer();
    }

    checkLocalFunctionsServer() {
        this._globalStateService.checkLocalFunctionsServer()
            .subscribe(v => {
                this.isLocalServerRunning = v;
                if (this.shown && !this.isLocalServerRunning) {
                    setTimeout(() => this.checkLocalFunctionsServer(), 1000);
                }
            });
    }

    hide() {
        this.shown = false;
    }

    switchToAzure() {
        this.selectedMode = 'Azure';
        this._globalStateService.switchToAzure();
    }

    switchToLocal() {
        if (this.isLocalServerRunning) {
            this.selectedMode = 'Local';
            this._globalStateService.switchToLocalServer();
        }
    }

    launchVsCode() {
        this._functionsService.launchVsCode()
            .subscribe(e => console.log(e));
    }

}
