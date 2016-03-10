/// <reference path="..\typings\browser.d.ts" />

import {bootstrap} from 'angular2/platform/browser';
import {HTTP_PROVIDERS} from 'angular2/http';
import {AppComponent} from './components/app.component';
import {provide, ExceptionHandler} from 'angular2/core';
import {FunctionsService} from './services/functions.service';
import {MockFunctionsService} from './services/mock-functions.service';
import {UserService} from './services/user.service';
import {MockUserService} from './services/mock-user.service';
import {PortalService} from './services/portal.service';
import {IBroadcastService} from './services/ibroadcast.service';
import {BroadcastService} from './services/broadcast.service';
import {FunctionsExceptionHandler} from './handlers/functions.exception-handler';
import {GettingStartedComponent} from './components/getting-started.component';

var mockedProviders = [
    provide(FunctionsService, { useClass: MockFunctionsService }),
    provide(UserService, { useClass: MockUserService })
];

var prodProviders = [
    provide(FunctionsService, { useClass: FunctionsService }),
    provide(UserService, { useClass: UserService })
];

var commonProviders = [
    HTTP_PROVIDERS,
    PortalService,
    provide(IBroadcastService, { useClass: BroadcastService }),
    provide(ExceptionHandler, { useClass: FunctionsExceptionHandler })
];

var isProd = window.location.protocol === 'https:';
var app = document.cookie.indexOf('authenticated=true')
    ? AppComponent
    : GettingStartedComponent;


if (isProd) {
    bootstrap(app, commonProviders.concat(prodProviders));
} else {
    bootstrap(app, commonProviders.concat(mockedProviders));
}