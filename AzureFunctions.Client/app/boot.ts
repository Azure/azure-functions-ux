/// <reference path="..\typings\main.d.ts" />

import {bootstrap} from 'angular2/platform/browser';
import {HTTP_PROVIDERS} from 'angular2/http';
import {AppComponent} from './components/app.component';
import {provide} from 'angular2/core';
import {FunctionsService} from './services/functions.service';
import {MockFunctionsService} from './services/mock-functions.service';
import {UserService} from './services/user.service';
import {MockUserService} from './services/mock-user.service';

if (window.location.href.indexOf('localhost') !== -1) {
    bootstrap(AppComponent, [HTTP_PROVIDERS, provide(FunctionsService, { useClass: MockFunctionsService }), provide(UserService, { useClass: MockUserService })]);
} else {
    bootstrap(AppComponent, [HTTP_PROVIDERS, provide(FunctionsService, { useClass: FunctionsService }), provide(UserService, { useClass: UserService })]);
}