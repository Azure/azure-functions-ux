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

    openBlade(name : string){
        this._portalService.openBlade(name);
    }
}