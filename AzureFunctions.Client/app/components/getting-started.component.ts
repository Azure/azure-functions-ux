import {Component} from 'angular2/core';

@Component({
    selector: 'getting-started',
    templateUrl: 'templates/getting-started.component.html',
    styleUrls: ['styles/getting-started.style.css']
})
export class GettingStartedComponent {
    login() {
        window.location.replace(`${window.location.protocol}//${window.location.hostname}/signin${window.location.search}`);
    }
}