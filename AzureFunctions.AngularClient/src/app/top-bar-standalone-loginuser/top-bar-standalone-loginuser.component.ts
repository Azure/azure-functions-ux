import { Component, Input } from '@angular/core';
import { User } from '../shared/models/user';
import { ConfigService } from './../shared/services/config.service';
import { Router} from '@angular/router';

@Component({
    selector: 'top-bar-standalone-loginuser',
    templateUrl: './top-bar-standalone-loginuser.component.html',
    styleUrls: ['./top-bar-standalone-loginuser.component.scss'],
})
export class TopBarStandAloneLoginUserComponent {
    @Input() user: User;
    public isStandalone: boolean;
    constructor(
        private _configService: ConfigService,
        private router: Router
    ) {
        this.isStandalone = this._configService.isStandalone();
    }

    logout() {
        this.router.navigate(['/'], { queryParams: {logout: 'true'} });
        window.location.reload();
    }
}
