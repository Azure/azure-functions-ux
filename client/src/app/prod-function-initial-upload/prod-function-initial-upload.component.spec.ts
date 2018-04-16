import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/zip';
import { ProdFunctionInitialUploadComponent } from './prod-function-initial-upload.component';
import { MockModule, MockComponent } from 'ng-mocks';
import { NgUploaderModule, UploadOutput, UploadFile, UploadInput, UploadStatus } from 'ngx-uploader';
import { Injectable } from '@angular/core';
import { SiteService } from '../shared/services/site.service';
import { Observable } from 'rxjs/Observable';
import { CacheService } from '../shared/services/cache.service';
import { GlobalStateService } from '../shared/services/global-state.service';
import { Subject } from 'rxjs/Subject';
import { CardInfoControlComponent } from '../controls/card-info-control/card-info-control.component';
import { TranslateModule } from '@ngx-translate/core';

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
        { provide: GlobalStateService, useClass: MockGlobalStateService }

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
    it('resourceId should pass in through global state service', () => {
      const globalStateService: MockGlobalStateService = TestBed.get(GlobalStateService);
      globalStateService.resourceId$.next('resourceIdValue');
      expect(component.resourceId).toBe('resourceIdValue');
    });

    it('resourceId should give AzureWebjobsStorageId', () => {
      const globalStateService: MockGlobalStateService = TestBed.get(GlobalStateService);
      globalStateService.resourceId$.next('resourceIdValue');
      expect(component.storageAccountString).toBe('testval');
    });

    it('resourceId should trigger getting a blob sas url', () => {
      const globalStateService: MockGlobalStateService = TestBed.get(GlobalStateService);
      globalStateService.resourceId$.next('resourceIdValue');
      expect(component.blobSasUrl).toBe('sasUrl');
    });

    it('should show if has Webjobs storage connection string and not run from zip', () => {
      const globalStateService: MockGlobalStateService = TestBed.get(GlobalStateService);
      globalStateService.resourceId$.next('resourceIdValue');
      expect(component.show).toBeTruthy();
    });
    it('should be hidden if no Webjobs storage connection string', () => {
      const globalStateService: MockGlobalStateService = TestBed.get(GlobalStateService);
      const mockSiteService: MockSiteService = TestBed.get(SiteService);
      mockSiteService.validAzureWebjobsStorageValue = false;
      globalStateService.resourceId$.next('resourceIdValue');
      expect(component.show).toBeFalsy();
    });
    it('should be hidden if run from zip is set up', () => {
      const globalStateService: MockGlobalStateService = TestBed.get(GlobalStateService);
      const mockSiteService: MockSiteService = TestBed.get(SiteService);
      mockSiteService.includeRunFromZip = true;
      globalStateService.resourceId$.next('resourceIdValue');
      expect(component.show).toBeFalsy();
    });

    it('should be hidden if call to get app settings fails', () => {
      const globalStateService: MockGlobalStateService = TestBed.get(GlobalStateService);
      const mockSiteService: MockSiteService = TestBed.get(SiteService);
      mockSiteService.successful = false;
      globalStateService.resourceId$.next('resourceIdValue');
      expect(component.show).toBeFalsy();
    });

    it('should be hidden NEW_PROD_FUNCTION is not set', () => {
      const globalStateService: MockGlobalStateService = TestBed.get(GlobalStateService);
      const mockSiteService: MockSiteService = TestBed.get(SiteService);
      mockSiteService.newProdFunction = false;
      globalStateService.resourceId$.next('resourceIdValue');
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
      const globalStateService: MockGlobalStateService = TestBed.get(GlobalStateService);
      globalStateService.resourceId$.next('testid');
      const uploadEvent: UploadOutput = {
        type: 'done',
        file: null,
        nativeFile: null
      };

      component.onUploadOutput(uploadEvent);
      expect(mockCacheService.putArmResourceId).toBe('testid/config/appSettings');
      expect(mockCacheService.putArmContent.properties.WEBSITE_USE_ZIP).toBe(component.blobSasUrl);
      expect(mockCacheService.putArmContent.properties.AzureWebJobsStorage).toBe('testval');
      expect(mockCacheService.putArmContent.properties.NEW_PROD_FUNCTION).toBeUndefined();
    });
  });
});


@Injectable()
class MockGlobalStateService {
  public resourceId$ = new Subject();
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