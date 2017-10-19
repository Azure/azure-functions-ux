import { ConfigService } from 'app/shared/services/config.service';
import { Url } from './shared/Utilities/url';
import { BackgroundTasksService } from './shared/services/background-tasks.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { BusyStateComponent } from './busy-state/busy-state.component';
import { GlobalStateService } from './shared/services/global-state.service';
import { UserService } from './shared/services/user.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
    theme: string;

    @ViewChild(BusyStateComponent) busyStateComponent: BusyStateComponent;

    constructor(
        private _userService: UserService,
        private _globalStateService: GlobalStateService,
        // Although we are not using BackgroundTasksService, we need to reference it here.
        // Otherwise, Angular won't new it up, and it's needed for local development
        // for retrieving and updating the token.
        _backgroundTasksService: BackgroundTasksService,
        private _router: Router,
        route: ActivatedRoute,
        configService: ConfigService
    ) {
        const devGuide = Url.getParameterByName(null, 'appsvc.devguide');


        this._userService.getStartupInfo()
            .subscribe(info => {
                if (this.theme) {
                    // Need to make sure we continue to set the theme even if we don't want to
                    // rerun the routing logic below.
                    this.theme = info.theme;
                    return;
                }

                this.theme = info.theme;

                // TODO: for now we don't honor any deep links.  We'll need to make a bunch of updates to our
                // tree logic in order to get it working properly
                if (_globalStateService.showTryView) {
                    this._router.navigate(['/try'], { queryParams: Url.getQueryStringObj() });
                } else if (devGuide) {
                    this._router.navigate(['/devguide'], { queryParams: Url.getQueryStringObj() });
                } else if (
                    !this._userService.inIFrame &&
                    window.location.protocol !== 'http:' &&
                    !this._userService.inTab &&
                    !configService.isStandalone() &&
                    !this._userService.deeplinkAllowed
                ) {
                    this._router.navigate(['/landing'], { queryParams: Url.getQueryStringObj() });
                } else if (!this._userService.deeplinkAllowed) {
                    this._router.navigate(['/resources/apps'], { queryParams: Url.getQueryStringObj() });
                }
            });
    }

    ngOnInit() { }

    ngAfterViewInit() {
        this._globalStateService.GlobalBusyStateComponent = this.busyStateComponent;
    }
}
