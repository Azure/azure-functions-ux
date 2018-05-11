import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeploymentCredentialsComponent } from './deployment-credentials.component';
import { TextboxComponent } from '../../../../controls/textbox/textbox.component';
import { MockComponent } from 'ng-mocks';
import { TranslateModule } from '@ngx-translate/core';
import { CardInfoControlComponent } from '../../../../controls/card-info-control/card-info-control.component';
import { CommonModule } from '@angular/common';
import { CopyPreComponent } from '../../../../copy-pre/copy-pre.component';
import { BusyStateComponent } from '../../../../busy-state/busy-state.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CacheService } from '../../../../shared/services/cache.service';
import { BroadcastService } from '../../../../shared/services/broadcast.service';
import { LogService } from '../../../../shared/services/log.service';
import { MockLogService } from '../../../../test/mocks/log.service.mock';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { By } from '@angular/platform-browser';
import { TelemetryService } from '../../../../shared/services/telemetry.service';
import { MockTelemetryService } from '../../../../test/mocks/telemetry.service.mock';
import { SiteService } from '../../../../shared/services/site.service';

describe('DeploymentCredentialsComponent', () => {
  let component: DeploymentCredentialsComponent;
  let fixture: ComponentFixture<DeploymentCredentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DeploymentCredentialsComponent, MockComponent(TextboxComponent), MockComponent(CardInfoControlComponent), MockComponent(CopyPreComponent), MockComponent(BusyStateComponent)],
      providers: [
        { provide: CacheService, useClass: MockCacheService },
        { provide: LogService, useClass: MockLogService },
        { provide: TelemetryService, useClass: MockTelemetryService },
        { provide: SiteService, useClass: MockSiteService },
        BroadcastService

      ],
      imports: [TranslateModule.forRoot(), CommonModule, ReactiveFormsModule, FormsModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeploymentCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const cacheService: MockCacheService = TestBed.get(CacheService);
    const siteService: MockSiteService = TestBed.get(SiteService);
    cacheService.siteService = siteService;
  });

  describe('init', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load app creds and parse publish profile at init', () => {
      expect(component.appUserName).toBe('$username');
      expect(component.appPwd).toBe('password');
    });

    it('should load user level username at start', () => {
      expect(component.userPasswordForm.value.userName).toBe('username');
    });

    it('should default to user tab', () => {
      expect(component.activeTab).toBe('user');
    });
  });

  describe('tabs', () => {
    it('should show user creds when user tab is selected', () => {
      const elem = fixture.debugElement.query(By.css('#userCredsForm'));
      expect(elem).toBeTruthy();
    });

    it('should show app creds when app tab is selected', () => {
      component.selectTab('app');
      fixture.detectChanges();
      const elem = fixture.debugElement.query(By.css('#appCredsForm'));
      expect(elem).toBeTruthy();
    });
  });

  describe('actions', () => {
    const setFormToValues = (username: string = '', password: string = '', confirmPassword: string = '') => {
      component.userPasswordForm.setValue({
        userName: username,
        password: password,
        passwordConfirm: confirmPassword
      });
    };
    it('reset should reset password and fetch new password', () => {
      component.resetPublishingProfile();
      expect(component.appPwd).toBe('newpassword');
    });

    it('should save user level credentials', () => {
      const mockCacheService: MockCacheService = TestBed.get(CacheService);

      setFormToValues('username', 'password', 'password');
      component.userPasswordForm.updateValueAndValidity();
      component.saveUserCredentails();
      expect(component.userPasswordForm.valid).toBeTruthy();
      expect(mockCacheService.savedCreds.properties.publishingUserName).toBe('username');
      expect(mockCacheService.savedCreds.properties.publishingPassword).toBe('password');
    });

    it('should invalidate non matching password field', () => {
      setFormToValues('username', 'password', 'badpassword');
      expect(component.userPasswordForm.valid).toBeFalsy();
    });
  });
});

class MockSiteService {
  public password = 'password';
  public mockPublishProfile = `
  <publishData>
    <publishProfile profileName="test" publishMethod="MSDeploy" publishUrl="publishurl" msdeploySite="test" userName="$username" userPWD="{0}" destinationAppUrl="http://testurl" SQLServerDBConnectionString="" mySQLDBConnectionString="" hostingProviderForumLink="" controlPanelLink="testControlPanelLink" webSystem="testWebSystem">
        <databases />
    </publishProfile>
    <publishProfile profileName="test" publishMethod="FTP"  publishUrl="publishurl" msdeploySite="test" userName="$username" userPWD="{0}" destinationAppUrl="http://testurl" SQLServerDBConnectionString="" mySQLDBConnectionString="" hostingProviderForumLink="" controlPanelLink="testControlPanelLink" webSystem="testWebSystem">
        <databases />
    </publishProfile>
</publishData>
  `;
  getPublishingProfile(resourceId: string): any {
    return of({
      result: this.mockPublishProfile.format(this.password)
    });
  }
}

class MockCacheService {

  public siteService: MockSiteService = null;
  public savedCreds = null;
  getArm(resourceId: string, force?: boolean, apiVersion?: string, invokeApi?: boolean): Observable<any> {
    return of({
      json: () => {
        return {
          properties: {
            publishingUserName: 'username'
          }
        };
      }
    });

  }

  postArm(resourceId: string, force?: boolean, apiVersion?: string, content?: any, cacheKeyPrefix?: string): Observable<any> {
    if (resourceId.includes('/publishxml')) {

    } else if (resourceId.includes('/newpassword')) {
      this.siteService.password = 'newpassword';
    }
    return Observable.of(null);
  }

  putArm(resourceId: string, apiVersion?: string, content?: any): Observable<any> {
    this.savedCreds = content;
    return of(null);
  }
}
