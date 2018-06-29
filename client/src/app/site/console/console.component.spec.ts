import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { ConsoleComponent } from './console.component';
import { TranslateModule } from '@ngx-translate/core';
import { ConsoleService } from './services/console.service';
import { Injectable, NgModule } from '@angular/core';
import { Headers, HttpModule } from '@angular/http';
import { Observable } from 'rxjs';
import { SiteService } from '../../shared/services/site.service';
import { LogService } from '../../shared/services/log.service';
import { MockLogService } from '../../test/mocks/log.service.mock';
import { CacheService } from '../../shared/services/cache.service';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { PromptComponent } from './templates/prompt.component';
import { MessageComponent } from './templates/message.component';
import { ErrorComponent } from './templates/error.component';
import { CommonModule } from '@angular/common';

describe('ConsoleComponent', () => {
  let component: ConsoleComponent;
  let fixture: ComponentFixture<ConsoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({

      imports: [
        TranslateModule.forRoot(), HttpModule, TestComponents
      ],
      providers: [
        BroadcastService,
        { provide: ConsoleService, useClass: MockConsoleService },
        { provide: SiteService, useClass: MockSiteService },
        { provide: CacheService, useClass: MockCacheService },
        { provide: LogService, useClass: MockLogService },
      ],
      declarations: [ConsoleComponent],
    })
      .compileComponents().then(() => {
        fixture = TestBed.createComponent(ConsoleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(ConsoleComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

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
      expect(component.dir).toEqual("D:\\home\\site\\wwwroot");
    }));

    // command elements should be empty by default, 
    // with the excpetion of middle command element which should just be a ' '<space>
    it('command should be empty by default', async(() => {
      expect(component.commandInParts.lCmd).toEqual("");
      expect(component.commandInParts.mCmd).toEqual(" ");
      expect(component.commandInParts.rCmd).toEqual("");
    }));
  });

  describe('console-focus', () => {
    // mouse-click outside the console,
    // this will de-focus the console.
    it('unfocus the console', fakeAsync(() => {
      component.unFocusConsole();
      expect(component.isFocused).toBeFalsy();
    }));

    //focus the console back after being out of focus
    it('focus the console', fakeAsync(() => {
      component.unFocusConsole();
      expect(component.isFocused).toBeFalsy();
      component.focusConsole();
      expect(component.isFocused).toBeTruthy();
    }));
  });

  describe('key-events', () => {
    it('Ctrl + C', fakeAsync(() => {
      component.commandInParts.lCmd = "python";
      component.handleCopy(null);
      expect(component.commandInParts.lCmd).toEqual("");
    }));

    it('Ctrl + V', fakeAsync(() => {
      component.handlePaste({clipboardData: new TestClipboard()});
      expect(component.commandInParts.lCmd).toEqual("paste");
    }));

    it('alphanumeric-key', fakeAsync(() => {
      component.keyEvent({which: 67, key: 'c'});
      expect(component.commandInParts.lCmd).toEqual("c");
    }));

    it('down-arrow-press', fakeAsync(() => {
      component.keyEvent({which: 67, key: 'c'});
      expect(component.commandInParts.lCmd).toEqual("c");
      component.keyEvent({which: 38, key: 'left'});
      expect(component.commandInParts.lCmd).toEqual("");
    }));

    it('backspace-press', fakeAsync(() => {
      component.keyEvent({which: 67, key: 'c'});
      component.keyEvent({which: 86, key: 'v'});
      expect(component.commandInParts.lCmd).toEqual("cv");
      component.keyEvent({which: 8, key: 'backspace'});
      expect(component.commandInParts.lCmd).toEqual("c");
    }));

    it('esc-key-press', fakeAsync(() => {
      component.keyEvent({which: 86, key: 'v'});
      component.keyEvent({which: 86, key: 'v'});
      expect(component.commandInParts.lCmd).toEqual("vv");
      component.keyEvent({which: 27, key: 'esc'});
      expect(component.commandInParts.lCmd).toEqual("");
    }));

    it('enter-key-press', (() => {
      component.keyEvent({which: 86, key: 'v'});
      expect(component.commandInParts.lCmd).toEqual("v");
      component.keyEvent({which: 13, key: 'enter'});
      expect(component.commandInParts.lCmd).toEqual("");
      expect(fixture.nativeElement.querySelector('.console-message-error')).toBeNull();
    }));

  });

});

class TestClipboard{
  getData(type: string){
    return 'paste';
  }
}

@Injectable()
class MockCacheService {
  postArm(resourceId: string, force?: boolean, apiVersion?: string, content?: any, cacheKeyPrefix?: string): Observable<any> {
    return Observable.of(null);
  }
}

@Injectable()
class MockSiteService {
  public siteObject = {
    properties: {
      hostNameSslStates: [{ name: "", hostType: 1 }]
    }
  };
  getSite(resourceId: string) {
    return Observable.of({
      isSuccessful: true,
      result: this.siteObject
    });
  }
}

@Injectable()
class MockConsoleService {
  /**
   * Connect the given service(url) using the passed in method, 
   * body and header elements.
   * @param method : String, one of {GET, POST, PUT, DELETE}
   * @param url : String
   * @param body: any?
   * @param headers: Headers?
   */
  send(method: string, url: string, body?: any, headers?: Headers) {
    // url = "https://funcplaceholder01.scm.azurewebsites.net/api/command";
    // const request = new Request({
    //   url: url,
    //   method: method,
    //   search: null,
    //   headers: headers,
    //   body: body ? body : null
    // });
    return Observable.of(null);
  }

  /**
   * Find all the strings which start with the given string, 'cmd' from the given string array
   * Incase the string is empty, the inital array of strings is returned.
   */
  findMatchingStrings(allFiles: string[], cmd: string): string[] {
    if (!cmd || cmd == '') {
      return allFiles;
    }
    let ltOfDir: string[] = [];
    cmd = cmd.toLowerCase();
    allFiles.forEach(element => {
      if (element.toLowerCase().startsWith(cmd)) {
        ltOfDir.push(element);
      }
    });
    return ltOfDir;
  }
}

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [PromptComponent, MessageComponent, ErrorComponent,],
  entryComponents: [PromptComponent, MessageComponent, ErrorComponent,]
})
class TestComponents {

}