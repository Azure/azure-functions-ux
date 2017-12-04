import { Component, Input } from '@angular/core';
import { User } from '../shared/models/user';
import { UserService } from '../shared/services/user.service';

@Component({
    selector: 'top-bar-standalone-loginuser',
    templateUrl: './top-bar-standalone-loginuser.component.html',
    styleUrls: ['./top-bar-standalone-loginuser.component.scss'],
})

export class TopBarStandAloneLoginUserComponent {
    @Input() user: User;
    public showUserMenu: boolean;
    constructor(
        private _userService: UserService
    ) {
        this.showUserMenu = false;
    }

    logout() {
        this._userService.logout();
        window.location.reload();
    }

    dispalyName(): string {
        const parts = this.user.given_name.split('\\');
        return parts[parts.length - 1];
    }

    userId(): string {
        return this.user.unique_name;
    }
}
