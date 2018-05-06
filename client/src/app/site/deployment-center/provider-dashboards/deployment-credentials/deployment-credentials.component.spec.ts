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

describe('DeploymnetCredentialsComponent', () => {
  let component: DeploymentCredentialsComponent;
  let fixture: ComponentFixture<DeploymentCredentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DeploymentCredentialsComponent, MockComponent(TextboxComponent), MockComponent(CardInfoControlComponent), MockComponent(CopyPreComponent), MockComponent(BusyStateComponent)],
      providers: [
        { provide: CacheService, useClass: MockCacheService },
        { provide: LogService, useClass: MockLogService },
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
  });

  describe('init', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  
});

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
    return of({
      text: () => this.mockPublishProfile
    });
  }

  putArm(resourceId: string, apiVersion?: string, content?: any): Observable<any> {
    return of(null);
  }
}
