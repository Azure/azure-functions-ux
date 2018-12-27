import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ConfigureBitbucketComponent } from './configure-bitbucket.component';
import { async } from 'q';
import { DeploymentCenterStateManager } from '../../wizard-logic/deployment-center-state-manager';
import { TranslateModule } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CacheService } from '../../../../../shared/services/cache.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LogService } from '../../../../../shared/services/log.service';
import { WizardForm } from '../../wizard-logic/deployment-center-setup-models';
import { MockLogService } from '../../../../../test/mocks/log.service.mock';
import { NgSelectTestHelpers, KeyCode } from '../../../../../test/mocks/ng-select-helpers.mock';
import { Subject } from 'rxjs/Subject';

// TODO, TRAVIS: FIX TESTS
describe('ConfigureBitbucketComponent', () => {
  let component: ConfigureBitbucketComponent;
  let testFixture: ComponentFixture<ConfigureBitbucketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigureBitbucketComponent],
      providers: [
        { provide: DeploymentCenterStateManager, useClass: MockDeploymentCenterStateManager },
        { provide: CacheService, useClass: MockCacheService },
        { provide: LogService, useClass: MockLogService },
        FormBuilder,
      ],
      imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule, NgSelectModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    testFixture = TestBed.createComponent(ConfigureBitbucketComponent);
    component = testFixture.componentInstance;
    testFixture.detectChanges();
  });

  describe('init', () => {
    // it('Repos should load at start', () => {
    //     expect(component.RepoList.length).toBeGreaterThan(0);
    // });

    // it('RepoList should have name as value and url as value ', () => {
    //     const repo = component.RepoList[0];
    //     expect(repo.displayLabel).toBe('testName1');
    //     expect(repo.value).toBe(`${DeploymentCenterConstants.bitbucketUrl}/testfullname1`);
    // });

    it('BranchList should start empty', () => {
      expect(component.BranchList.length).toBe(0);
    });

    it('should start with nothing selected', () => {
      const mockDeploymentCenterStateManager: MockDeploymentCenterStateManager = TestBed.get(DeploymentCenterStateManager);
      expect(component.selectedBranch).toBeNull();
      expect(component.selectedRepo).toBeNull();
      expect(mockDeploymentCenterStateManager.wizardValues.sourceSettings.repoUrl).toBeNull();
      expect(mockDeploymentCenterStateManager.wizardValues.sourceSettings.branch).toBeNull();
    });
  });

  describe('Selection Behavior', () => {
    // it('should be able to select repo', () => {
    //     const mockDeploymentCenterStateManager: MockDeploymentCenterStateManager = TestBed.get(DeploymentCenterStateManager);
    //     NgSelectTestHelpers.selectOption(testFixture, 'configure-bitbucket-repo-select', KeyCode.ArrowDown, 0);
    //     const expectedRepoUrl = `${DeploymentCenterConstants.bitbucketUrl}/testfullname1`;
    //     expect(component.selectedRepo).toBe(expectedRepoUrl);
    //     expect(mockDeploymentCenterStateManager.wizardValues.sourceSettings.repoUrl).toBe(expectedRepoUrl);
    // });

    it('branch list should be populated with correct branches when repo is selected', () => {
      NgSelectTestHelpers.selectOption(testFixture, 'configure-bitbucket-repo-select', KeyCode.ArrowDown, 0);
      component.BranchList.forEach(x => {
        expect(x.value).toContain(`-testfullname1`);
      });
    });

    // it('should be able to select branch', () => {
    //     const mockDeploymentCenterStateManager: MockDeploymentCenterStateManager = TestBed.get(DeploymentCenterStateManager);
    //     component.RepoChanged({
    //         displayLabel: '',
    //         value: `${DeploymentCenterConstants.bitbucketUrl}/testfullname1`,
    //     });
    //     testFixture.detectChanges();
    //     NgSelectTestHelpers.selectOption(testFixture, 'configure-bitbucket-branch-select', KeyCode.ArrowDown, 0);

    //     const expectedbranch = 'testBranch1-testfullname1';
    //     expect(component.selectedBranch).toBe(expectedbranch);
    //     expect(mockDeploymentCenterStateManager.wizardValues.sourceSettings.branch).toBe(expectedbranch);
    // });
  });

  describe('Form Validation', () => {
    // TODO: Form Validation
  });
});

@Injectable()
class MockDeploymentCenterStateManager {
  public wizardForm: FormGroup;
  public updateSourceProviderConfig$ = new Subject();
  constructor(_fb: FormBuilder) {
    this.wizardForm = _fb.group({
      sourceProvider: [null],
      buildProvider: ['kudu'],
      sourceSettings: _fb.group({
        repoUrl: ['github'],
        branch: [null],
        isManualIntegration: [false],
        deploymentRollbackEnabled: [false],
        isMercurial: [false],
      }),
      buildSettings: _fb.group({
        createNewVsoAccount: [false],
        vstsAccount: ['account'],
        vstsProject: [null],
        location: [null],
        applicationFramework: [null],
        workingDirectory: [null],
        pythonSettings: _fb.group({
          framework: [null],
          version: [null],
          flaskProjectName: ['flaskProjectName'],
          djangoSettingsModule: ['DjangoProjectName.settings'],
        }),
        nodejsTaskRunner: [null],
      }),
      deploymentSlotSetting: _fb.group({
        newDeploymentSlot: [false],
        deploymentSlotEnabled: [false],
        deploymentSlot: ['slot'],
      }),
    });
  }

  public get wizardValues(): WizardForm {
    return this.wizardForm.value;
  }
  public get sourceSettings(): FormGroup {
    return (this.wizardForm && (this.wizardForm.controls.sourceSettings as FormGroup)) || null;
  }

  public getToken() {
    return '';
  }
}

@Injectable()
class MockCacheService {
  public siteObject = {
    location: 'loc',
    properties: {
      sku: 'sku',
    },
  };
  get(url: string, force?: boolean, headers?: Headers, invokeApi?: boolean): Observable<Response> {
    return Observable.of(null);
  }

  post(url: string, force?: boolean, headers?: Headers, content?: { url: string }) {
    if (content.url.includes('/repositories?role=admin')) {
      return Observable.of({
        json: () => {
          return {
            values: [
              {
                name: 'testName1',
                full_name: 'testfullname1',
              },
              {
                name: 'testName2',
                full_name: 'testfullname2',
              },
              {
                name: 'testName3',
                full_name: 'testfullname3',
              },
              {
                name: 'testName4',
                full_name: 'testfullname4',
              },
            ],
          };
        },
      });
    } else if (content.url.includes('/refs/branches')) {
      const repo = content.url.split('/')[5];
      return Observable.of({
        json: () => {
          return {
            values: [
              {
                name: `testBranch1-${repo}`,
              },
              {
                name: `testBranch1-${repo}`,
              },
              {
                name: `testBranch1-${repo}`,
              },
              {
                name: `testBranch1-${repo}`,
              },
            ],
          };
        },
      });
    }
    return Observable.of(null);
  }

  getArm(resourceId: string, force?: boolean, apiVersion?: string, invokeApi?: boolean) {
    return Observable.of({
      json: () => {
        return this.siteObject;
      },
    });
  }

  postArm(resourceId: string, force?: boolean, apiVersion?: string, content?: any): Observable<Response> {
    return Observable.of(null);
  }

  putArm(resourceId: string, apiVersion?: string, content?: any) {
    return Observable.of({
      json: () => {
        return content;
      },
    });
  }
}
