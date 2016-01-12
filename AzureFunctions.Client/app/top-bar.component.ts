import {Component, OnInit} from 'angular2/core';
import {User} from './user';

@Component({
    selector: 'top-bar',
    templateUrl: 'templates/top-bar.html'
})
export class TopBarComponent {
    public user: User;
}