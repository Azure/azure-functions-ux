import {Component} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {PortalService} from '../services/portal.service';
 import {CHART_DIRECTIVES} from 'angular2-highcharts';

@Component({
    selector: 'app-monitoring',
    templateUrl: 'templates/app-monitoring.component.html',
    styleUrls: ['styles/app-settings.style.css']
})

export class AppMonitoringComponent {
    constructor(private _functionsService: FunctionsService,
        private _portalService: PortalService) { }

    openBlade(name: string) {
        this._portalService.openBlade(name);
    }
}