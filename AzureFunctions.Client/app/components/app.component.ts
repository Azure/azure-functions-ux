import {Component} from 'angular2/core';
import {DashboardComponent} from './dashboard.component';
import {GettingStartedComponent} from './getting-started.component';

@Component({
    selector: 'azure-functions-app',
    template: `<busy-state></busy-state>
<functions-dashboard *ngIf="loggedin"></functions-dashboard>
<getting-started *ngIf="!loggedin"></getting-started>`,
    directives: [DashboardComponent, GettingStartedComponent]
})
export class AppComponent {
    public loggedin: boolean;
    constructor() {
        this.loggedin = document.cookie.indexOf('authenticated=true') !== -1 ||
            window.location.protocol === 'http:';
    }
}