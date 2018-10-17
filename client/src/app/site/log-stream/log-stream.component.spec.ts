import { MockScenarioService } from './../../test/mocks/scenario.service.mock';
import { ScenarioService } from './../../shared/services/scenario/scenario.service';
import { LoadImageDirective } from './../../controls/load-image/load-image.directive';
import { CommandBarComponent } from './../../controls/command-bar/command-bar.component';
import { AppLogStreamComponent } from './log-stream.component';
import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Injector } from '@angular/core';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { TelemetryService } from '../../shared/services/telemetry.service';
import { MockTelemetryService } from '../../test/mocks/telemetry.service.mock';
import { MockSiteService, MockCacheService } from '../console/shared/services/mock.services';
import { MockLogService } from '../../test/mocks/log.service.mock';
import { LogService } from '../../shared/services/log.service';
import { CacheService } from '../../shared/services/cache.service';
import { SiteService } from '../../shared/services/site.service';
import { MockDirective } from 'ng-mocks';
import { RadioSelectorComponent } from '../../radio-selector/radio-selector.component';
import { PopOverComponent } from '../../pop-over/pop-over.component';
import { UtilitiesService } from '../../shared/services/utilities.service';
import { UserService } from '../../shared/services/user.service';
import { FunctionAppService } from '../../shared/services/function-app.service';
import { LogEntryComponent } from './log-entry.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { StartupInfo } from '../../shared/models/portal';
import { CommandComponent } from '../../controls/command-bar/command/command.component';

describe('LogStreamComponent', () => {
  let component: AppLogStreamComponent;
  let fixture: ComponentFixture<AppLogStreamComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), CommonModule, BrowserModule, FormsModule],
      providers: [
        BroadcastService,
        Injector,
        { provide: TelemetryService, useClass: MockTelemetryService },
        { provide: SiteService, useClass: MockSiteService },
        { provide: CacheService, useClass: MockCacheService },
        { provide: LogService, useClass: MockLogService },
        { provide: UtilitiesService, useClass: MockUtilitiesService },
        { provide: UserService, useClass: MockUserService },
        { provide: FunctionAppService, useClass: MockFunctionAppService },
        { provide: ScenarioService, useClass: MockScenarioService },
      ],
      declarations: [
        AppLogStreamComponent,
        CommandBarComponent,
        CommandComponent,
        LogEntryComponent,
        MockDirective(LoadImageDirective),
        MockDirective(RadioSelectorComponent),
        MockDirective(PopOverComponent),
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppLogStreamComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));
  /** Test cases for Log-stream will be here. */
  describe('init', () => {
    it('should create', async(() => {
      expect(component).toBeTruthy();
    }));

    it('logs should be empty by default', async(() => {
      expect(component.logsText).toEqual('');
    }));

    it('application logs selected by default', async(() => {
      expect(component.toggleLog).toBeTruthy();
    }));

    it('clear logs is turned off by default', async(() => {
      expect(component.clearLogs).toBeFalsy();
    }));
  });
});

class MockUtilitiesService {
  copyContentToClipboard() {}
}
class MockUserService {
  private _startupInfoStream: ReplaySubject<StartupInfo<any>>;
  getStartupInfo() {
    this._startupInfoStream = new ReplaySubject<StartupInfo<any>>(1);
    return this._startupInfoStream;
  }
}
class MockFunctionAppService {
  _tryFunctionsBasicAuthToken = false;
}
