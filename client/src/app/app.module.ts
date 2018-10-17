import { Observable } from 'rxjs/Observable';
import { UserService } from './shared/services/user.service';
import { RouterModule, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, Injectable } from '@angular/core';
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
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/zip';
// Prevents a route from loading until the observable has been resolved
@Injectable()
export class InitResolver implements Resolve<any> {
  constructor(private _userService: UserService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this._userService.getStartupInfo().first();
  }
}

export const routes = RouterModule.forRoot([
  // "/resources" will load the main component which has the tree view for all resources
  {
    path: 'resources',
    loadChildren: 'app/main/main.module#MainModule',
    resolve: { info: InitResolver },
  },

  // "/landing" will load the getting started page for functions.azure.com
  {
    path: 'landing',
    loadChildren: 'app/getting-started/getting-started.module#GettingStartedModule',
    resolve: { info: InitResolver },
  },

  // "/try" will load the try functions start page for https://functions.azure.com?trial=true
  {
    path: 'try',
    loadChildren: 'app/try-landing/try-landing.module#TryLandingModule',
    resolve: { info: InitResolver },
  },

  // "/feature" will load a window to show a specific feature(i.e. app settings) with nothing else, defined by query string
  {
    path: 'feature',
    loadChildren: 'app/ibiza-feature/ibiza-feature.module#IbizaFeatureModule',
    resolve: { info: InitResolver },
  },

  // /devguide
  {
    path: 'devguide',
    loadChildren: 'app/dev-guide/dev-guide.module#DevGuideModule',
  },
]);

@NgModule(AppModule.moduleDefinition)
export class AppModule {
  static moduleDefinition = {
    declarations: [AppComponent, ErrorListComponent, DisabledDashboardComponent],
    imports: [
      SharedModule.forRoot(),
      ReactiveFormsModule,
      BrowserModule,
      BrowserAnimationsModule,
      HttpModule,
      TranslateModule.forRoot(),
      PopoverModule,
      routes,
    ],
    providers: [InitResolver],
    bootstrap: [AppComponent],
  };
}
