import {Component, Input, Output, EventEmitter, OnInit, OnChanges} from '@angular/core';
import {UserService} from '../services/user.service';
import {FunctionsService} from '../services/functions.service';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {User} from '../models/user';
import {Subscription} from '../models/subscription';
import {DropDownElement} from '../models/drop-down-element';
import {DropDownComponent} from './drop-down.component';
import {TopBarComponent} from './top-bar.component';
import {ArmService} from '../services/arm.service';
import {FunctionContainer} from '../models/function-container';
import {Observable} from 'rxjs/Rx';
import {TelemetryService} from '../services/telemetry.service';
import {GlobalStateService} from '../services/global-state.service';
import {TenantInfo} from '../models/tenant-info';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';


@Component({
    selector: 'getting-started',
    templateUrl: 'templates/getting-started.component.html',
    styleUrls: ['styles/getting-started.style.css'],
    directives: [DropDownComponent, TopBarComponent],
    pipes: [TranslatePipe]
})
export class GettingStartedComponent implements OnInit {
    @Output() userReady: EventEmitter<FunctionContainer>;

    public geoRegions: DropDownElement<string>[];
    public subscriptions: DropDownElement<Subscription>[];
    public functionContainers: DropDownElement<FunctionContainer>[];
    public selectedSubscription: Subscription;
    public selectedGeoRegion: string;
    public functionContainerName: string;
    public createError: string;
    public functionContainerNameEvent: EventEmitter<string>;
    public isValidContainerName: boolean;
    public validationError: string;

    public user: User;

    private functionContainer: FunctionContainer;
    constructor(
        private _userService: UserService,
        private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _armService: ArmService,
        private _telemetryService: TelemetryService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService
    ) {
        this.isValidContainerName = true;
        //http://stackoverflow.com/a/8084248/3234163
        var secret = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        this.functionContainerName = `functions${this.makeId()}`;
        this.functionContainers = [];
        this.userReady = new EventEmitter<FunctionContainer>();
        this.geoRegions = [];
        this.functionContainerNameEvent = new EventEmitter<string>();
        this.functionContainerNameEvent
            .switchMap<{ isValid: boolean; reason: string }>(() => this.validateContainerName(this.functionContainerName))
            .subscribe(v => {
                this.isValidContainerName = v.isValid;
                this.validationError = v.reason;
            });
    }

    ngOnInit() {
        this._globalStateService.setBusyState();
        this._userService.getToken().subscribe(() =>
            this._userService.getTenants().subscribe(tenants => {

                    this._armService.getSubscriptions().subscribe(subs => {
                        this.subscriptions = subs
                            .map(e => ({ displayLabel: e.displayName, value: e }))
                            .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
                        this._globalStateService.clearBusyState();
                    });
                
            })
        );

        this._userService.getUser()
            .subscribe(u => {
                this.user = u;
                this._globalStateService.clearBusyState();
            });

    }

    createFunctionsContainer() {
        delete this.createError;
        this._globalStateService.setBusyState();
        this._telemetryService.track('gettingstarted-create-functionapp');

        this._armService.createFunctionContainer(this.selectedSubscription.subscriptionId, this.selectedGeoRegion, this.functionContainerName)
            .subscribe(r => {
                this.userReady.emit(r);
                this._globalStateService.clearBusyState();
            });
    }

    onSubscriptionSelect(value: Subscription) {
        this._globalStateService.setBusyState();
        delete this.selectedGeoRegion;
        this._armService.getFunctionContainers(value.subscriptionId)
            .subscribe(fc => {
                this.selectedSubscription = value;
                this.functionContainers = fc
                    .map(c => ({
                        displayLabel: `${c.name} (${c.location})`,
                        value: c
                    }))
                    .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));

                this._globalStateService.clearBusyState();
                this.functionContainerNameEvent.emit(this.functionContainerName);
            });
        this._armService.getDynamicStampLocations(value.subscriptionId)
            .subscribe(r => {
                this.geoRegions = r
                    .map(e => ({ displayLabel: e.displayName, value: e.name }))
                    .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
                if (this.geoRegions.length === 0) {
                    this.createError = this._translateService.instant(PortalResources.gettingStarted_subIsNotWhitelisted, {displayName: value.displayName, subscriptionId: value.subscriptionId });
                } else {
                    delete this.createError;
                }
            });
    }

    onGeoRegionChange(value: string) {
        this.selectedGeoRegion = value;
    }

    onContainerChange(value: FunctionContainer) {
        this.functionContainer = value;
    }

    openSelectedContainer() {
        this._armService.warmUpFunctionApp(this.functionContainer.id);
        this.userReady.emit(this.functionContainer);
    }

    login() {
        window.location.replace(`${window.location.protocol}//${window.location.hostname}/signin${window.location.search}`);
    }

    // http://stackoverflow.com/a/1349426/3234163
    makeId() {
        var text = '';
        var possible = 'abcdef123456789';

        for (var i = 0; i < 8; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    validateContainerName(name: string): Observable<{ isValid: boolean; reason: string }> {
        var regEx = /^[0-9a-zA-Z][0-9a-zA-Z-]*[a-zA-Z0-9]$/;

        if (name.length < 2) {
            return Observable.of({ isValid: false, reason: this._translateService.instant(PortalResources.gettingStarted_validateContainer1) });
        } else if (name.length > 60) {
            return Observable.of({ isValid: false, reason: this._translateService.instant(PortalResources.gettingStarted_validateContainer2) });
        } else if (!name.match(regEx)) {
            return Observable.of({ isValid: false, reason: this._translateService.instant(PortalResources.gettingStarted_validateContainer3) });
        } else {
            return this._armService.validateSiteNameAvailable(this.selectedSubscription.subscriptionId, name)
                .map<{ isValid: boolean; reason: string }>(v => ({ isValid: v, reason: this._translateService.instant(PortalResources.gettingStarted_validateContainer4, { funcName: name }) }));
        }
    }
}
