import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProdFunctionInitialUploadComponent } from './prod-function-initial-upload.component';
import { MockModule, MockComponent } from 'ng-mocks';
import { NgUploaderModule, UploadOutput, UploadFile, UploadInput, UploadStatus } from 'ngx-uploader';
import { Injectable } from '@angular/core';
import { SiteService } from '../shared/services/site.service';
import { Observable } from 'rxjs/Observable';
import { CacheService } from '../shared/services/cache.service';
import { CardInfoControlComponent } from '../controls/card-info-control/card-info-control.component';
import { TranslateModule } from '@ngx-translate/core';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { DashboardType } from '../tree-view/models/dashboard-type';

describe('ProdFunctionInitialUploadComponent', () => {
  let component: ProdFunctionInitialUploadComponent;
  let fixture: ComponentFixture<ProdFunctionInitialUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProdFunctionInitialUploadComponent,
        MockComponent(CardInfoControlComponent)
      ],
      providers: [
        { provide: SiteService, useClass: MockSiteService },
        { provide: CacheService, useClass: MockCacheService },
        { provide: BroadcastService, useClass: MockBroadcastService }

      ],
      imports: [
        MockModule(NgUploaderModule),
        TranslateModule.forRoot()
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProdFunctionInitialUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('init', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
    it('should be off by default', () => {
      expect(component.show).toBeFalsy();
    });
  });

  describe('setup', () => {
    it('resourceId should pass in when Tree Naviation Events happen to app dashbaord', () => {
      const mockBroadcastService: MockBroadcastService = TestBed.get(BroadcastService);
      mockBroadcastService.resourceId$.next('/subscriptions/sub/resourcegroups/rg/providers/Microsoft.Web/sites/resourceIdValue');
      expect(component.resourceId).toBe('/subscriptions/sub/resourcegroups/rg/providers/Microsoft.Web/sites/resourceIdValue');
    });

    it('resourceId should give AzureWebjobsStorageId', () => {
      const mockBroadcastService: MockBroadcastService = TestBed.get(BroadcastService);
      mockBroadcastService.resourceId$.next('/subscriptions/sub/resourcegroups/rg/providers/Microsoft.Web/sites/resourceIdValue');
      expect(component.storageAccountString).toBe('testval');
    });

    it('resourceId should trigger getting a blob sas url', () => {
      const mockBroadcastService: MockBroadcastService = TestBed.get(BroadcastService);
      mockBroadcastService.resourceId$.next('/subscriptions/sub/resourcegroups/rg/providers/Microsoft.Web/sites/resourceIdValue');
      expect(component.blobSasUrl).toBe('sasUrl');
    });

    it('should show if has Webjobs storage connection string and not run from zip', () => {
      const mockBroadcastService: MockBroadcastService = TestBed.get(BroadcastService);
      mockBroadcastService.resourceId$.next('/subscriptions/sub/resourcegroups/rg/providers/Microsoft.Web/sites/resourceIdValue');
      expect(component.show).toBeTruthy();
    });
    it('should be hidden if no Webjobs storage connection string', () => {
      const mockBroadcastService: MockBroadcastService = TestBed.get(BroadcastService);
      const mockSiteService: MockSiteService = TestBed.get(SiteService);
      mockSiteService.validAzureWebjobsStorageValue = false;
      mockBroadcastService.resourceId$.next('/subscriptions/sub/resourcegroups/rg/providers/Microsoft.Web/sites/resourceIdValue');
      expect(component.show).toBeFalsy();
    });
    it('should be hidden if run from zip is set up', () => {
      const mockBroadcastService: MockBroadcastService = TestBed.get(BroadcastService);
      const mockSiteService: MockSiteService = TestBed.get(SiteService);
      mockSiteService.includeRunFromZip = true;
      mockBroadcastService.resourceId$.next('/subscriptions/sub/resourcegroups/rg/providers/Microsoft.Web/sites/resourceIdValue');
      expect(component.show).toBeFalsy();
    });

    it('should be hidden if call to get app settings fails', () => {
      const mockBroadcastService: MockBroadcastService = TestBed.get(BroadcastService);
      const mockSiteService: MockSiteService = TestBed.get(SiteService);
      mockSiteService.successful = false;
      mockBroadcastService.resourceId$.next('/subscriptions/sub/resourcegroups/rg/providers/Microsoft.Web/sites/resourceIdValue');
      expect(component.show).toBeFalsy();
    });

    it('should be hidden NEW_PROD_FUNCTION is not set', () => {
      const mockBroadcastService: MockBroadcastService = TestBed.get(BroadcastService);
      const mockSiteService: MockSiteService = TestBed.get(SiteService);
      mockSiteService.newProdFunction = false;
      mockBroadcastService.resourceId$.next('/subscriptions/sub/resourcegroups/rg/providers/Microsoft.Web/sites/resourceIdValue');
      expect(component.show).toBeFalsy();
    });
    it('should be hidden if opening dashbaord type is not App Dashboard', () => {
      const mockBroadcastService: MockBroadcastService = TestBed.get(BroadcastService);
      mockBroadcastService.dashboardType = DashboardType.ProxyDashboard;
      mockBroadcastService.resourceId$.next('/subscriptions/sub/resourcegroups/rg/providers/Microsoft.Web/sites/resourceIdValue');
      expect(component.show).toBeFalsy();
    });
  });

  const uploadFile: UploadFile = {
    id: 'id',
    fileIndex: 0,
    lastModifiedDate: new Date(2000, 1, 1),
    name: 'file',
    size: 512,
    type: 'application/zip',
    form: null,
    progress: null
  };
  describe('Upload Actions', () => {

    it('should start upload when allAddedToQueue', (done) => {
      component.uploadInput.subscribe((item: UploadInput) => {
        expect(item.type).toBe('uploadFile');
        done();
      });
      const uploadEvent: UploadOutput = {
        type: 'allAddedToQueue',
        file: uploadFile,
        nativeFile: null
      };
      component.onUploadOutput(uploadEvent);
    });

    it('should start add file when file is dropped', () => {
      expect(component.file).toBeNull();
      const uploadEvent: UploadOutput = {
        type: 'addedToQueue',
        file: uploadFile,
        nativeFile: null
      };
      component.onUploadOutput(uploadEvent);
      expect(component.file).toBe(uploadEvent.file);
    });

    it('should not start add file when file is dropped but file is undefined', () => {
      expect(component.file).toBeNull();
      const uploadEvent: UploadOutput = {
        type: 'addedToQueue',
        file: undefined,
        nativeFile: null
      };
      component.onUploadOutput(uploadEvent);
      expect(component.file).toBeNull();
    });

    it('should update file progress while uploading', () => {
      expect(component.file).toBeNull();
      component.file = uploadFile;
      const f = {
        ...uploadFile, progress: {
          status: UploadStatus.Uploading
        }
      };
      const uploadEvent: UploadOutput = {
        type: 'uploading',
        file: f,
        nativeFile: null
      };
      component.onUploadOutput(uploadEvent);
      expect(component.file.progress).not.toBeNull();
      expect(component.file.progress.status).toBe(UploadStatus.Uploading);
    });

    it('should update app settings when done uploading', () => {
      const mockCacheService: MockCacheService = TestBed.get(CacheService);
      const mockBroadcastService: MockBroadcastService = TestBed.get(BroadcastService);
      mockBroadcastService.resourceId$.next('/subscriptions/sub/resourcegroups/rg/providers/Microsoft.Web/sites/resourceIdValue');
      const uploadEvent: UploadOutput = {
        type: 'done',
        file: null,
        nativeFile: null
      };

      component.onUploadOutput(uploadEvent);
      expect(mockCacheService.putArmResourceId).toBe('/subscriptions/sub/resourcegroups/rg/providers/Microsoft.Web/sites/resourceIdValue/config/appSettings');
      expect(mockCacheService.putArmContent.properties.WEBSITE_USE_ZIP).toBe(component.blobSasUrl);
      expect(mockCacheService.putArmContent.properties.AzureWebJobsStorage).toBe('testval');
      expect(mockCacheService.putArmContent.properties.NEW_PROD_FUNCTION).toBeUndefined();
    });
  });
});


@Injectable()
class MockBroadcastService {
  public resourceId$ = new ReplaySubject<string>();
  public dashboardType = DashboardType.AppDashboard;
  getEvents<T>(eventType: BroadcastEvent): Observable<T> {
    if (eventType === BroadcastEvent.TreeNavigation) {
      return this.resourceId$
        .map(e => {
          const ret: any = {
            dashboardType: this.dashboardType,
            resourceId: e
          };
          return ret as T;
        });
    } else {
      return Observable.of(null);
    }
  }
}
@Injectable()
class MockCacheService {
  public putArmResourceId = '';
  public putArmContent = null;
  post(url: string, force?: boolean, headers?: Headers, content?: any) {
    return Observable.of({
      json: () => {
        return {
          sasUrl: 'sasUrl'
        };
      }
    });
  }
  putArm(resourceId: string, apiVersion?: string, content?: any) {
    this.putArmContent = content;
    this.putArmResourceId = resourceId;
    return Observable.of(null);
  }
}

@Injectable()
class MockSiteService {
  public validAzureWebjobsStorageValue = true;
  public includeRunFromZip = false;
  public newProdFunction = true;
  public successful = true;
  getAppSettings(resourceId: string) {
    return Observable.of({
      isSuccessful: this.successful,
      result: {
        properties: {
          AzureWebJobsStorage: this.validAzureWebjobsStorageValue ? 'testval' : undefined,
          WEBSITE_USE_ZIP: this.includeRunFromZip ? 'testval' : undefined,
          NEW_PROD_FUNCTION: this.newProdFunction ? 'true' : undefined
        }
      }
    });
  }
}