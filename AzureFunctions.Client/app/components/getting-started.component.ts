import {Component} from 'angular2/core';

@Component({
    selector: 'azure-functions-app',
    templateUrl: 'templates/getting-started.component.html',
    styleUrls: ['styles/getting-started.style.css']
})
export class GettingStartedComponent {
    login() {
        window.location.replace(`${window.location.protocol}//${window.location.hostname}/signin`);
    }
}