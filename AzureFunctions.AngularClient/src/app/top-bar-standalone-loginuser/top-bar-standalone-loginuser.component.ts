import { Component, Input } from '@angular/core';
import { User } from '../shared/models/user';
import { ConfigService } from './../shared/services/config.service';


@Component({
    selector: 'top-bar-standalone-loginuser',
    templateUrl: './top-bar-standalone-loginuser.component.html',
    styleUrls: ['./top-bar-standalone-loginuser.component.scss'],
})
export class TopBarStandAloneLoginUserComponent {
    @Input() user: User;
    public isStandalone: boolean;
    constructor(private _configService: ConfigService) {
        this.isStandalone = this._configService.isStandalone();
    }
}
