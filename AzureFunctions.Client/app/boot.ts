/// <reference path="..\typings\browser.d.ts" />

import {bootstrap} from 'angular2/platform/browser';
import {HTTP_PROVIDERS} from 'angular2/http';
import {AppComponent} from './components/app.component';
import {provide, ExceptionHandler, enableProdMode} from 'angular2/core';
import {FunctionsService} from './services/functions.service';
import {MockFunctionsService} from './services/mock-functions.service';
import {UserService} from './services/user.service';
import {MockUserService} from './services/mock-user.service';
import {PortalService} from './services/portal.service';
import {IBroadcastService} from './services/ibroadcast.service';
import {BroadcastService} from './services/broadcast.service';
import {FunctionsExceptionHandler} from './handlers/functions.exception-handler';
import {ArmService} from './services/arm.service';
import {MonitoringService} from './services/appMonitoring.service';
import {TelemetryService} from './services/telemetry.service';

declare var mixpanel: any;


if (window.location.protocol === 'http:') {
    bootstrap(
        AppComponent,
        [
            HTTP_PROVIDERS,
            provide(FunctionsService, { useClass: MockFunctionsService }),
            provide(UserService, { useClass: MockUserService }),
            PortalService,
            provide(IBroadcastService, { useClass: BroadcastService }),
            provide(ExceptionHandler, { useClass: FunctionsExceptionHandler }),
            provide(ArmService, { useClass: ArmService }),
            provide(MonitoringService, { useClass: MonitoringService }),
            TelemetryService
        ]);
} else {
    if (window.location.hostname.indexOf('localhost') === -1) {
        enableProdMode();
    }

    bootstrap(
        AppComponent,
        [
            HTTP_PROVIDERS,
            provide(FunctionsService, { useClass: FunctionsService }),
            provide(UserService, { useClass: UserService }),
            PortalService,
            provide(IBroadcastService, { useClass: BroadcastService }),
            provide(ExceptionHandler, { useClass: FunctionsExceptionHandler }),
            provide(ArmService, { useClass: ArmService }),
            provide(MonitoringService, { useClass: MonitoringService }),
            TelemetryService
        ]);
}

if (typeof mixpanel !==  'undefined') {
    var correlationId = getParameterByName("correlationId");
    if (correlationId) {
        mixpanel.identify(correlationId);
    }
}

// http://stackoverflow.com/a/901144
function getParameterByName(name: string): string {
    var url = window.location.href;
    url = url.toLowerCase(); // This is just to avoid case sensitiveness  
    name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();// This is just to avoid case sensitiveness for query parameter name
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}