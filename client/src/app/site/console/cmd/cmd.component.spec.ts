import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { CmdComponent } from './cmd.component';
import { TranslateModule } from '@ngx-translate/core';
import { ConsoleService } from './../shared/services/console.service';
import { Injector } from '@angular/core';
import { HttpModule } from '@angular/http';
import { SiteService } from '../../../shared/services/site.service';
import { LogService } from '../../../shared/services/log.service';
import { MockLogService } from '../../../test/mocks/log.service.mock';
import { CacheService } from '../../../shared/services/cache.service';
import { BroadcastService } from '../../../shared/services/broadcast.service';
import { TelemetryService } from '../../../shared/services/telemetry.service';
import { MockTelemetryService } from '../../../test/mocks/telemetry.service.mock';
import { MockDirective } from 'ng-mocks';
import { LoadImageDirective } from '../../../controls/load-image/load-image.directive';
import { TestClipboard, MockConsoleService, MockSiteService, MockCacheService } from '../shared/services/mock.services';
import { MessageComponent } from '../shared/components/message.component';
import { CommonModule } from '@angular/common';
import { PromptComponent } from '../shared/components/prompt.component';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

describe('CmdConsoleComponent', () => {
  let component: CmdComponent;
  let fixture: ComponentFixture<CmdComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(), HttpModule, CommonModule
      ],
      providers: [
        BroadcastService, Injector,
        {provide: TelemetryService, useClass: MockTelemetryService},
        { provide: ConsoleService, useClass: MockConsoleService },
        { provide: SiteService, useClass: MockSiteService },
        { provide: CacheService, useClass: MockCacheService },
        { provide: LogService, useClass: MockLogService },
      ],
      declarations: [CmdComponent, MockDirective(LoadImageDirective), MessageComponent, PromptComponent]
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [MessageComponent, PromptComponent]
      }
    }).compileComponents().then(() => {
        fixture = TestBed.createComponent(CmdComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  describe('init', () => {
    it('should create', async(() => {
      expect(component).toBeTruthy();
    }));

    // command elements should be empty by default,
    // with the excpetion of middle command element which should just be a ' '<space>
    it('console should be in focus by default', () => {
      expect(component.isFocused).toBeTruthy();
    });

    // fixed directory
    it('default dir is fixed', async(() => {
      expect(component.dir).toEqual('D:\\home\\site\\wwwroot');
    }));

    // command elements should be empty by default,
    // with the excpetion of middle command element which should just be a ' '<space>
    it('command should be empty by default', async(() => {
      expect(component.commandInParts.leftCmd).toEqual('');
      expect(component.commandInParts.middleCmd).toEqual(' ');
      expect(component.commandInParts.rightCmd).toEqual('');
    }));
  });

  describe('console-focus', () => {
    // mouse-click outside the console,
    // this will de-focus the console.
    it('unfocus the console', fakeAsync(() => {
      component.unFocusConsole();
      expect(component.isFocused).toBeFalsy();
    }));

    // focus the console back after being out of focus
    it('focus the console', fakeAsync(() => {
      component.unFocusConsole();
      expect(component.isFocused).toBeFalsy();
      component.focusConsole();
      expect(component.isFocused).toBeTruthy();
    }));
  });

  describe('key-events', () => {
    it('Ctrl + C', async(() => {
      component.commandInParts.leftCmd = 'python';
      component.handleCopy(null);
      expect(component.commandInParts.leftCmd).toEqual('');
    }));

    it('Ctrl + V', fakeAsync(() => {
      component.handlePaste({clipboardData: new TestClipboard()});
      expect(component.commandInParts.leftCmd).toEqual('paste');
    }));

    it('alphanumeric-key', fakeAsync(() => {
      component.keyEvent({which: 67, key: 'c'});
      expect(component.commandInParts.leftCmd).toEqual('c');
    }));

    it('down-arrow-press', fakeAsync(() => {
      component.keyEvent({which: 67, key: 'c'});
      expect(component.commandInParts.leftCmd).toEqual('c');
      component.keyEvent({which: 38, key: 'left'});
      expect(component.commandInParts.leftCmd).toEqual('');
    }));

    it('backspace-press', fakeAsync(() => {
      component.keyEvent({which: 67, key: 'c'});
      component.keyEvent({which: 86, key: 'v'});
      expect(component.commandInParts.leftCmd).toEqual('cv');
      component.keyEvent({which: 8, key: 'backspace'});
      expect(component.commandInParts.leftCmd).toEqual('c');
    }));

    it('esc-key-press', fakeAsync(() => {
      component.keyEvent({which: 86, key: 'v'});
      component.keyEvent({which: 86, key: 'v'});
      expect(component.commandInParts.leftCmd).toEqual('vv');
      component.keyEvent({which: 27, key: 'esc'});
      expect(component.commandInParts.leftCmd).toEqual('');
    }));
  });
});
