import {Component} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';

@Component({
    selector: 'app-settings',
    templateUrl: 'templates/app-settings.component.html',
    styleUrls: ['styles/app-settings.style.css']
})
export class AppSettingsComponent {
    constructor(private _functionsService : FunctionsService){}
}