import { Component, Input } from '@angular/core';
import { User } from '../shared/models/user';

@Component({
    selector: 'top-bar-standalone-loginuser',
    templateUrl: './top-bar-standalone-loginuser.component.html',
    styleUrls: ['./top-bar-standalone-loginuser.component.scss'],
})
export class TopBarStandAloneLoginUserComponent {
    @Input() user: User;
    constructor() {
    }
}
