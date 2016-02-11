import {Component, OnInit} from 'angular2/core';
import {UserService} from '../services/user.service';
import {User} from '../models/user';
import {TenantInfo} from '../models/tenant-info';

@Component({
    selector: 'top-bar',
    templateUrl: 'templates/top-bar.html'
})
export class TopBarComponent implements OnInit {
    public user: User;
    public tenants: TenantInfo[];
    public currentTenant: TenantInfo;

    constructor(private _userService: UserService) { }

    ngOnInit() {
        this._userService.getUser()
            .subscribe(u => this.user = u);

        this._userService.getTenants()
            .subscribe(t => {
                this.tenants = t;
                this.currentTenant = this.tenants.find(e => e.Current);
            });
    }

    selectTenant(tenant: TenantInfo) {
        window.location.href = `api/switchtenants/${tenant.TenantId}`;
    }
}