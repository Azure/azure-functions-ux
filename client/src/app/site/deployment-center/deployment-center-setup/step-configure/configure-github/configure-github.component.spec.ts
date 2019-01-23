import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ConfigureGithubComponent } from './configure-github.component';
import { Headers } from '@angular/http';
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
import { Url } from '../../../../../shared/Utilities/url';
import { MockLogService } from '../../../../../test/mocks/log.service.mock';
import { NgSelectTestHelpers, KeyCode } from '../../../../../test/mocks/ng-select-helpers.mock';
import { Subject } from 'rxjs/Subject';

describe('ConfigureGithubComponent', () => {
  let component: ConfigureGithubComponent;
  let testFixture: ComponentFixture<ConfigureGithubComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigureGithubComponent],
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
    testFixture = TestBed.createComponent(ConfigureGithubComponent);
    component = testFixture.componentInstance;
    testFixture.detectChanges();
  });

  describe('init', () => {
    it('Orgs should load at start', () => {
      expect(component.OrgList.length).toBeGreaterThan(0);
    });

    it('Repos should be empty at start', () => {
      expect(component.RepoList.length).toBe(0);
    });

    it('Branches should be empty at start', () => {
      expect(component.BranchList.length).toBe(0);
    });
  });

  describe('Form Flow', () => {
    it('Repo list should populate when org is changed', () => {
      NgSelectTestHelpers.selectOption(testFixture, 'configure-github-org-select', KeyCode.ArrowDown, 0);
      testFixture.detectChanges();
      expect(component.RepoList.length).toBeGreaterThan(0);
    });

    it('User repo list works with multi paging', () => {
      const cacheService: MockCacheService = TestBed.get(CacheService);
      cacheService.maxPagesRepo = 5;
      NgSelectTestHelpers.selectOption(testFixture, 'configure-github-org-select', KeyCode.ArrowDown, 0);
      testFixture.detectChanges();
      expect(component.selectedOrg).toBe('github.com/users/');
      expect(component.RepoList.length).toBe(10);
    });

    it('Org repo list works with multi paging', () => {
      const cacheService: MockCacheService = TestBed.get(CacheService);
      cacheService.maxPagesRepo = 5;
      NgSelectTestHelpers.selectOption(testFixture, 'configure-github-org-select', KeyCode.ArrowDown, 1);
      testFixture.detectChanges();
      expect(component.selectedOrg).toBe('testOrgUrl1');
      expect(component.RepoList.length).toBe(10);
    });

    it('Org repo list works with multi paging', () => {
      const cacheService: MockCacheService = TestBed.get(CacheService);
      cacheService.maxPagesRepo = 5;
      NgSelectTestHelpers.selectOption(testFixture, 'configure-github-org-select', KeyCode.ArrowDown, 0);
      testFixture.detectChanges();
      expect(component.RepoList.length).toBe(10);
    });

    it('Repos without admin permissions should get filtered out', () => {
      NgSelectTestHelpers.selectOption(testFixture, 'configure-github-org-select', KeyCode.ArrowDown, 1);
      testFixture.detectChanges();
      expect(component.RepoList.length).toBe(2);
      component.RepoList.forEach(repo => {
        expect(repo.displayLabel).toBe(`adminenabled`);
      });
    });

    it('Selecting a repo changes selected repo', () => {
      NgSelectTestHelpers.selectOption(testFixture, 'configure-github-org-select', KeyCode.ArrowDown, 0);
      testFixture.detectChanges();
      NgSelectTestHelpers.selectOption(testFixture, 'configure-github-repo-select', KeyCode.ArrowDown, 0);
      testFixture.detectChanges();

      expect(component.selectedRepo).toBe('htmlurl');
    });

    it('Selecting a repo changes form value', () => {
      const deploymentStateManager: MockDeploymentCenterStateManager = TestBed.get(DeploymentCenterStateManager);
      NgSelectTestHelpers.selectOption(testFixture, 'configure-github-org-select', KeyCode.ArrowDown, 0);
      testFixture.detectChanges();
      NgSelectTestHelpers.selectOption(testFixture, 'configure-github-repo-select', KeyCode.ArrowDown, 0);
      testFixture.detectChanges();

      expect(deploymentStateManager.wizardValues.sourceSettings.repoUrl).toBe('htmlurl');
    });

    it('Branch list should populate when repo is changed', () => {
      NgSelectTestHelpers.selectOption(testFixture, 'configure-github-org-select', KeyCode.ArrowDown, 0);
      testFixture.detectChanges();
      NgSelectTestHelpers.selectOption(testFixture, 'configure-github-repo-select', KeyCode.ArrowDown, 0);
      testFixture.detectChanges();

      expect(component.BranchList.length).toBeGreaterThan(0);
    });

    it('Branches load with multipaging', () => {
      const cacheService: MockCacheService = TestBed.get(CacheService);
      cacheService.maxPagesBranch = 5;
      NgSelectTestHelpers.selectOption(testFixture, 'configure-github-org-select', KeyCode.ArrowDown, 0);
      testFixture.detectChanges();
      NgSelectTestHelpers.selectOption(testFixture, 'configure-github-repo-select', KeyCode.ArrowDown, 0);
      testFixture.detectChanges();

      expect(component.BranchList.length).toBe(15);
    });

    it('Branch list should populate when repo is changed', () => {
      NgSelectTestHelpers.selectOption(testFixture, 'configure-github-org-select', KeyCode.ArrowDown, 0);
      testFixture.detectChanges();
      NgSelectTestHelpers.selectOption(testFixture, 'configure-github-repo-select', KeyCode.ArrowDown, 0);
      testFixture.detectChanges();

      expect(component.BranchList.length).toBeGreaterThan(0);
    });

    it('Selecting a branch changes form value', () => {
      const deploymentStateManager: MockDeploymentCenterStateManager = TestBed.get(DeploymentCenterStateManager);
      NgSelectTestHelpers.selectOption(testFixture, 'configure-github-org-select', KeyCode.ArrowDown, 0);
      testFixture.detectChanges();
      NgSelectTestHelpers.selectOption(testFixture, 'configure-github-repo-select', KeyCode.ArrowDown, 0);
      testFixture.detectChanges();

      NgSelectTestHelpers.selectOption(testFixture, 'configure-github-branch-select', KeyCode.ArrowDown, 0);
      testFixture.detectChanges();
      expect(deploymentStateManager.wizardValues.sourceSettings.branch).toBe('branch');
    });
  });

  describe('Helper Functions', () => {
    it('_getLastPage should return last page', () => {
      const links = {
        last: 'https://api.github.com/resource?page=6',
      };
      const lastPage = component['_getLastPage'](links);
      expect(lastPage).toBe(6);
    });

    it('_getLastPage should return 1 when there is no last page', () => {
      const links = {};
      const lastPage = component['_getLastPage'](links);
      expect(lastPage).toBe(1);
    });

    it('_getLinks should return correct links regardless of order', () => {
      const order1 = [`<https://api.github.com/resource?page=5>; rel="last"`, `<https://api.github.com/resource?page=3>; rel="next"`];
      const order2 = [`<https://api.github.com/resource?page=5>; rel="last"`, `<https://api.github.com/resource?page=3>; rel="next"`];
      const links1 = component['_getLinks'](order1);
      const links2 = component['_getLinks'](order2);
      expect(links1.last).toBe(links2.last);
      expect(links1.next).toBe(links2.next);
    });
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
  public maxPagesRepo = 1;
  public maxPagesBranch = 1;

  post(url: string, force?: boolean, headers?: Headers, content?: { url: string }) {
    if (content.url.endsWith('/user/orgs')) {
      return Observable.of({
        json: () => {
          return [
            {
              login: 'Org1',
              url: 'testOrgUrl1',
            },
            {
              login: 'Org2',
              url: 'testOrgUrl2',
            },
            {
              login: 'Org3',
              url: 'testOrgUrl3',
            },
            {
              login: 'Org4',
              url: 'testOrgUrl4',
            },
          ];
        },
      });
    } else if (content.url.endsWith('/user')) {
      return Observable.of({
        json: () => {
          return {
            login: 'testUser1',
            repos_url: 'github.com/users/',
          };
        },
      });
    } else if (content.url.includes('/repos?')) {
      return this._getReposByPage(content.url);
    } else if (content.url.includes('/branches?')) {
      return this._getBranchesByPage(content.url);
    }

    return Observable.of(null);
  }

  private _getReposByPage(uri: string) {
    const page = +Url.getParameterByName(uri, 'page');
    const testHeaders = new Headers();
    if (this.maxPagesRepo > 1) {
      testHeaders.append(
        'link',
        `<https://api.github.com/resource?page=${page}>; rel="next",<https://api.github.com/resource?page=${this.maxPagesRepo}>; rel="last"`
      );
    }
    return Observable.of({
      headers: testHeaders,
      json: () => {
        return [
          {
            permissions: {
              admin: true,
              push: true,
              pull: true,
            },
            name: `adminenabled`,
            html_url: 'htmlurl',
            fullname: `adminenabled`,
          },
          {
            permissions: {
              admin: true,
              push: true,
              pull: true,
            },
            name: `adminenabled`,
            html_url: 'htmlurl',
            fullname: `adminenabled`,
          },
          {
            permissions: {
              admin: false,
              push: true,
              pull: true,
            },
            name: `admindisabled`,
            html_url: 'htmlurl',
            fullname: `admindisabled`,
          },
        ];
      },
    });
  }

  private _getBranchesByPage(uri: string) {
    const page = +Url.getParameterByName(uri, 'page');
    const testHeaders = new Headers();
    if (this.maxPagesBranch > 1) {
      testHeaders.append(
        'link',
        `<https://api.github.com/resource?page=${page}>; rel="next",<https://api.github.com/resource?page=${
          this.maxPagesBranch
        }>; rel="last"`
      );
    }
    return Observable.of({
      headers: testHeaders,
      json: () => {
        return [
          {
            name: 'branch',
          },
          {
            name: 'branch',
          },
          {
            name: 'branch',
          },
        ];
      },
    });
  }
}
