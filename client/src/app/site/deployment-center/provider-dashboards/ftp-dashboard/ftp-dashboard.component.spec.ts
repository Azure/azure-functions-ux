import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FtpDashboardComponent } from './ftp-dashboard.component';
import { SidebarModule } from 'ng-sidebar';
import { SiteService } from '../../../../shared/services/site.service';
import { BroadcastService } from '../../../../shared/services/broadcast.service';
import { LogService } from '../../../../shared/services/log.service';
import { MockLogService } from '../../../../test/mocks/log.service.mock';
import { CacheService } from '../../../../shared/services/cache.service';
import { CommandBarComponent } from '../../../../controls/command-bar/command-bar.component';
import { CommandComponent } from '../../../../controls/command-bar/command/command.component';
import { CommonModule } from '@angular/common';
import { CopyPreComponent } from '../../../../copy-pre/copy-pre.component';
import { RadioSelectorComponent } from '../../../../radio-selector/radio-selector.component';
import { InfoBoxComponent } from '../../../../controls/info-box/info-box.component';
import { CardInfoControlComponent } from '../../../../controls/card-info-control/card-info-control.component';
import { TranslateModule } from '@ngx-translate/core';
import { DeploymentCredentialsComponent } from '../deployment-credentials/deployment-credentials.component';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs/observable/of';
import { Observable } from 'rxjs/Observable';
import { Component, ViewChild } from '@angular/core';

describe('FtpDashboardComponent', () => {
  @Component({
    selector: `app-host-component`,
    template: `<app-ftp-dashboard resourceId="/subscriptions/sub/resourcegroups/rg/providers/microsoft.web/sites/sitename"></app-ftp-dashboard>`
  })
  class TestHostComponent {
    @ViewChild(FtpDashboardComponent)
    public ftpDashbaordComponent: FtpDashboardComponent;
  }

  let component: FtpDashboardComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestHostComponent,
         FtpDashboardComponent,
        MockComponent(CommandBarComponent),
        MockComponent(CommandComponent),
        MockComponent(CopyPreComponent),
        MockComponent(RadioSelectorComponent),
        MockComponent(InfoBoxComponent),
        MockComponent(CardInfoControlComponent),
        MockComponent(DeploymentCredentialsComponent)
      ],
      providers: [
        { provide: SiteService, useClass: MockSiteService },
        { provide: LogService, useClass: MockLogService },
        { provide: CacheService, useClass: MockCacheService },
        BroadcastService
      ],
      imports: [SidebarModule, CommonModule, TranslateModule.forRoot()]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance.ftpDashbaordComponent;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

class MockSiteService {
  public ftpsState = 'AllAllowed';
  getSiteConfig(resourceId: string) {
    return of({
      isSuccessful: true,
      result: {
        properties: {
          ftpsState: this.ftpsState
        }
      }
    });
  }
}

class MockCacheService {
  public mockPublishProfile = `
  <publishData>
    <publishProfile profileName="test" publishMethod="MSDeploy" publishUrl="publishurl" msdeploySite="test" userName="$username" userPWD="password" destinationAppUrl="http://testurl" SQLServerDBConnectionString="" mySQLDBConnectionString="" hostingProviderForumLink="" controlPanelLink="testControlPanelLink" webSystem="testWebSystem">
        <databases />
    </publishProfile>
    <publishProfile profileName="test" publishMethod="FTP"  publishUrl="publishurl" msdeploySite="test" userName="$username" userPWD="password" destinationAppUrl="http://testurl" SQLServerDBConnectionString="" mySQLDBConnectionString="" hostingProviderForumLink="" controlPanelLink="testControlPanelLink" webSystem="testWebSystem">
        <databases />
    </publishProfile>
</publishData>
  `;
  postArm(resourceId: string, force?: boolean, apiVersion?: string, content?: any, cacheKeyPrefix?: string): Observable<any> {
    return of({
      text: () => this.mockPublishProfile
    });
  }
}