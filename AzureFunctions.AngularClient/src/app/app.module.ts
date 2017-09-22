import { RouterModule } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { TranslateModule } from '@ngx-translate/core';
import { PopoverModule } from 'ng2-popover';
import { AppComponent } from './app.component';
import { ErrorListComponent } from './error-list/error-list.component';
import { DisabledDashboardComponent } from './disabled-dashboard/disabled-dashboard.component';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/takeuntil';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/zip';

const routes = RouterModule.forRoot([
    // "/resources" will load the main component which has the tree view for all resources
    { path: 'resources', loadChildren: 'app/main/main.module#MainModule' },

    // "/landing" will load the getting started page for functions.azure.com
    { path: 'landing', loadChildren: 'app/getting-started/getting-started.module#GettingStartedModule' },

    // "/try" will load the try functions start page for https://functions.azure.com?trial=true
    { path: 'try', loadChildren: 'app/try-landing/try-landing.module#TryLandingModule' },

    // "/feature" will load a window to show a specific feature(i.e. app settings) with nothing else, defined by query string
    { path: 'feature', loadChildren: 'app/ibiza-feature/ibiza-feature.module#IbizaFeatureModule' },

    // /devguide
    { path: 'devguide', loadChildren: 'app/dev-guide/dev-guide.module#DevGuideModule' }

]);

@NgModule(AppModule.moduleDefinition)
export class AppModule {
    static moduleDefinition = {
        declarations: [AppComponent, ErrorListComponent, DisabledDashboardComponent],
        imports: [SharedModule.forRoot(), ReactiveFormsModule, BrowserModule, HttpModule, TranslateModule.forRoot(), PopoverModule, routes],
        bootstrap: [AppComponent]
    };
}
