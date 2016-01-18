import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromArray';
import 'rxjs/add/observable/empty'
import 'rxjs/add/operator/catch';
import {bootstrap} from 'angular2/platform/browser';
import {HTTP_PROVIDERS} from 'angular2/http';
import {AppComponent} from './app.component';
import {provide} from 'angular2/core';
import {FunctionsService} from './functions.service';
import {MockFunctionsService} from './mock-functions.service';

bootstrap(AppComponent, [HTTP_PROVIDERS, provide(FunctionsService, {useClass: FunctionsService})]);