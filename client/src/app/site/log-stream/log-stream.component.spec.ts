import { LogStreamComponent } from './log-stream.component';
import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Injector, NgModule } from '@angular/core';
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
import { LogContentComponent } from './log-content.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { StartupInfo } from '../../shared/models/portal';

describe('LogStreamComponent', () => {
    let component: LogStreamComponent;
    let fixture: ComponentFixture<LogStreamComponent>;
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [
          TranslateModule.forRoot(), CommonModule, BrowserModule, FormsModule, LogStreamTestModule
        ],
        providers: [
          BroadcastService, Injector,
          {provide: TelemetryService, useClass: MockTelemetryService},
          { provide: SiteService, useClass: MockSiteService },
          { provide: CacheService, useClass: MockCacheService },
          { provide: LogService, useClass: MockLogService },
          { provide: UtilitiesService, useClass: MockUtilitiesService },
          { provide: UserService, useClass: MockUserService },
          { provide: FunctionAppService, useClass: MockFunctionAppService }
        ],
        declarations: [LogStreamComponent, MockDirective(RadioSelectorComponent), MockDirective(PopOverComponent)]
      }).compileComponents().then(() => {
          fixture = TestBed.createComponent(LogStreamComponent);
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

@NgModule({
  imports: [
    CommonModule
  ],
  entryComponents: [
    LogContentComponent
  ],
  declarations: [
    LogContentComponent
  ]
})
class LogStreamTestModule {}
class MockUtilitiesService {
  copyContentToClipboard() {

  }
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
