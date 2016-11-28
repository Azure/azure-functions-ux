import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import {TranslateModule} from 'ng2-translate';

//import {FunctionsExceptionHandler} from './handlers/functions.exception-handler';
import {FunctionsService} from './shared/services/functions.service';
import {UserService} from './shared/services/user.service';
import {PortalService} from './shared/services/portal.service';
import {BroadcastService} from './shared/services/broadcast.service';
import {FunctionMonitorService} from './shared/services/function-monitor.service'
import {ArmService} from './shared/services/arm.service';
import {MonitoringService} from './shared/services/app-monitoring.service';
import {TelemetryService} from './shared/services/telemetry.service';
import {UtilitiesService} from './shared/services/utilities.service';
import {BackgroundTasksService} from './shared/services/background-tasks.service';
import {GlobalStateService} from './shared/services/global-state.service';
import {AiService} from './shared/services/ai.service';

import { AppComponent } from './app.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { BusyStateComponent } from './busy-state/busy-state.component';
import { LocalDevelopmentInstructionsComponent } from './local-development-instructions/local-development-instructions.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TryNowBusyStateComponent } from './try-now-busy-state/try-now-busy-state.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { DropDownComponent } from './drop-down/drop-down.component';
import { TryNowComponent } from './try-now/try-now.component';

@NgModule({
  declarations: [
      AppComponent,

      GettingStartedComponent,
      BusyStateComponent,
      LocalDevelopmentInstructionsComponent,
      DashboardComponent,
      TryNowBusyStateComponent,
      TopBarComponent,
      DropDownComponent,
      TryNowComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
      HttpModule,
      TranslateModule.forRoot()
  ],
  providers: [
      FunctionsService,
      UserService,
      PortalService,
      BroadcastService,
      FunctionMonitorService,
      ArmService,
      MonitoringService,
      TelemetryService,
      UtilitiesService,
      BackgroundTasksService,
      GlobalStateService,
      AiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
