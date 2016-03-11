import {Component, Input, Output, EventEmitter, OnInit, OnChanges} from 'angular2/core';
import {UserService} from '../services/user.service';
import {FunctionsService} from '../services/functions.service';
import {BroadcastEvent, IBroadcastService} from '../services/ibroadcast.service';
import {User} from '../models/user';
import {Subscription} from '../models/subscription';
import {DropDownElement} from '../models/drop-down-element';
import {DropDownComponent} from './drop-down.component';
import {TopBarComponent} from './top-bar.component';

@Component({
    selector: 'getting-started',
    templateUrl: 'templates/getting-started.component.html',
    styleUrls: ['styles/getting-started.style.css'],
    directives: [DropDownComponent, TopBarComponent]
})
export class GettingStartedComponent implements OnInit {
    @Output() userReady: EventEmitter<boolean>;

    public tryItNow: boolean;
    public geoRegions: DropDownElement<string>[];
    public subscriptions: DropDownElement<Subscription>[];
    public selectedSubscription: Subscription;
    public selectedGeoRegion: string;

    public user: User;

    private tryAppServiceTenantId: string = "6224bcc1-1690-4d04-b905-92265f948dad";

    constructor(
        private _userService: UserService,
        private _functionsService: FunctionsService,
        private _broadcastService: IBroadcastService
    ) {
        this.userReady = new EventEmitter<boolean>();
        this.geoRegions = ['West US']
            .map(e => ({ displayLabel: e, value: e }))
            .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
    }

    ngOnInit() {
        this._broadcastService.setBusyState();

        this._userService.getUser()
            .subscribe(u => this.user = u);

        this._userService.getTenants()
            .subscribe(tenants => {
                this._broadcastService.clearBusyState();
                if (tenants.filter(e => e.TenantId.toLocaleLowerCase() !== this.tryAppServiceTenantId).length === 0) {
                    this.tryItNow = true;
                } else {
                    this.tryItNow = false;
                    this._broadcastService.setBusyState();
                    this._functionsService.getSubscriptions()
                        .subscribe(subs => {
                            this.subscriptions = subs
                                .map(e => ({ displayLabel: e.displayName, value: e }))
                                .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
                            this._broadcastService.clearBusyState();
                        });
                }
            });

    }

    createTrialFunctionsContainer() {
        this._broadcastService.setBusyState();
        this._functionsService.createTrialFunctionsContainer()
            .subscribe(r => this.switchToTryAppServiceTenant(), undefined, () => this._broadcastService.clearBusyState());
    }

    switchToTryAppServiceTenant() {
        window.location.href = `api/switchtenants/${this.tryAppServiceTenantId}${window.location.search}`;
    }

    createFunctionsContainer() {
        this._broadcastService.setBusyState();
        this._functionsService.createFunctionsContainer(this.selectedSubscription.subscriptionId, this.selectedGeoRegion)
            .subscribe(r => this.userReady.emit(true), undefined, () => this._broadcastService.clearBusyState());
    }

    onSubscriptionSelect(value: Subscription) {
        this.selectedSubscription = value;
    }

    onGeoRegionChange(value: string) {
        this.selectedGeoRegion = value;
    }

    login() {
        window.location.replace(`${window.location.protocol}//${window.location.hostname}/signin${window.location.search}`);
    }
}