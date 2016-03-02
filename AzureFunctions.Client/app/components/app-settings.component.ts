import {Component} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {PortalService} from '../services/portal.service';

@Component({
    selector: 'app-settings',
    templateUrl: 'templates/app-settings.component.html',
    styleUrls: ['styles/app-settings.style.css']
})
export class AppSettingsComponent {
    constructor(private _functionsService : FunctionsService,
                private _portalService : PortalService){}

    openContinuousDeployment(){
        this._portalService.openContinuousDeployment();
    }

    openAuthentication() {
        this._portalService.openAuthentication();
    }

    openCors() {
        this._portalService.openCors();
    }

    openApiDefinition() {
        this._portalService.openApiDefinition();
    }

    openApp(){
        this._portalService.openApp();
    }
}