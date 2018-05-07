import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { FtpDashboardComponent } from './ftp-dashboard.component';
import { SidebarModule } from 'ng-sidebar';
import { SiteService } from '../../../../shared/services/site.service';
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
import { ArmObj } from '../../../../shared/models/arm/arm-obj';
import { SiteConfig } from '../../../../shared/models/arm/site-config';

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
        { provide: CacheService, useClass: MockCacheService }
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

  describe('init', () => {
    it('should initialize', () => {
      expect(component).toBeTruthy();
    });

    it('should load publishing profile data on init', () => {
      expect(component.ftpsEndpoint).toBe('publishftpurl');
    });

    it('should load ftps state at init', () => {
      expect(component.ftpsEnabledControl.value).toBe('AllAllowed');
    });

    it('side panel should start off shut', () => {
      expect(component.sidePanelOpened).toBeFalsy();
    });
  });

  describe('save', () => {
    it('should save chosen ftpEnabledControl', () => {
      const mockCacheService: MockCacheService = TestBed.get(CacheService);
      component.ftpsEnabledControl.setValue('Disabled');
      component.save();
      expect(mockCacheService.lastPatchContent.properties.ftpsState).toBe('Disabled');
    });
  });

  describe('Publishing Profile Download', () => {

    it('download profile should trigger profile download', fakeAsync(() => {
      let alinkClicked = false;
      const aLinkMock = {
        click: () => alinkClicked = true
      };
      spyOn(window.URL, 'createObjectURL').and.callFake(() => 'objecturl');
      spyOn(document, 'getElementById').and.callFake(() => aLinkMock);
      component.downloadPublishProfile();
      tick();
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(alinkClicked).toBeTruthy();
    }));

    it('triggering when there is already a blobUrl will revoke Old BlobUrl', fakeAsync(() => {
      let alinkClicked = false;
      const aLinkMock = {
        click: () => alinkClicked = true
      };
      spyOn(window.URL, 'createObjectURL').and.callFake(() => 'objecturl');
      spyOn(document, 'getElementById').and.callFake(() => aLinkMock);
      spyOn(window.URL, 'revokeObjectURL').and.callFake(() => true);
      component.downloadPublishProfile();
      tick();
      component.downloadPublishProfile();
      tick();
      expect(window.URL.revokeObjectURL).toHaveBeenCalled();

    }));
    it('hits the right download path for edge', fakeAsync(() => {
      window.navigator.msSaveOrOpenBlob = (blob: any, name: string) => true;
      spyOn(window.navigator, 'msSaveOrOpenBlob').and.callFake(() => true);
      component.downloadPublishProfile();
      tick();
      expect(window.navigator.msSaveOrOpenBlob).toHaveBeenCalled();
    }));
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
    <publishProfile profileName="test" publishMethod="MSDeploy" publishUrl="publishmsdeployurl" msdeploySite="test" userName="$username" userPWD="password" destinationAppUrl="http://testurl" SQLServerDBConnectionString="" mySQLDBConnectionString="" hostingProviderForumLink="" controlPanelLink="testControlPanelLink" webSystem="testWebSystem">
        <databases />
    </publishProfile>
    <publishProfile profileName="test" publishMethod="FTP"  publishUrl="publishftpurl" msdeploySite="test" userName="$username" userPWD="password" destinationAppUrl="http://testurl" SQLServerDBConnectionString="" mySQLDBConnectionString="" hostingProviderForumLink="" controlPanelLink="testControlPanelLink" webSystem="testWebSystem">
        <databases />
    </publishProfile>
</publishData>
  `;

  public lastPatchContent: ArmObj<SiteConfig> = null;

  postArm(resourceId: string, force?: boolean, apiVersion?: string, content?: any, cacheKeyPrefix?: string): Observable<any> {
    return of({
      text: () => this.mockPublishProfile
    });
  }

  patchArm(resourceId: string, apiVersion?: string, content?: any): Observable<any> {
    this.lastPatchContent = content;
    return of(null);
  }
}
