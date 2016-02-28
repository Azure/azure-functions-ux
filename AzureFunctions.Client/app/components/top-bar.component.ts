import {Component, OnInit, EventEmitter} from 'angular2/core';
import {UserService} from '../services/user.service';
import {User} from '../models/user';
import {TenantInfo} from '../models/tenant-info';
import {PortalService} from '../services/portal.service';

@Component({
    selector: 'top-bar',
    templateUrl: 'templates/top-bar.component.html',
    styleUrls: ['styles/top-bar.style.css'],
    outputs: ['appSettingsClicked']
})
export class TopBarComponent implements OnInit {
    public user: User;
    public tenants: TenantInfo[];
    public currentTenant: TenantInfo;
    public inIFrame: boolean;
    private appSettingsClicked: EventEmitter<any>;

    constructor(private _userService: UserService, private _portalService : PortalService) { 
        this.appSettingsClicked = new EventEmitter<any>();
        this.inIFrame = this._portalService.inIFrame;
    }

    ngOnInit() {
        this._userService.getUser()
            .subscribe((u) => {
                this.user = u
            });

        this._userService.getTenants()
            .subscribe(t => {
                this.tenants = t;
                this.currentTenant = this.tenants.find(e => e.Current);
            });
    }

    selectTenant(tenant: TenantInfo) {
        window.location.href = `api/switchtenants/${tenant.TenantId}`;
    }

    onAppSettingsClicked(){
        this.appSettingsClicked.emit(null);
    }
}