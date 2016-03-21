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
import {ArmService} from './services/arm.service';

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
            provide(ArmService, { useClass: ArmService })
        ]);
} else {
    bootstrap(
        AppComponent,
        [
            HTTP_PROVIDERS,
            provide(FunctionsService, { useClass: FunctionsService }),
            provide(UserService, { useClass: UserService }),
            PortalService,
            provide(IBroadcastService, { useClass: BroadcastService }),
            provide(ExceptionHandler, { useClass: FunctionsExceptionHandler }),
            provide(ArmService, { useClass: ArmService })
        ]);
}