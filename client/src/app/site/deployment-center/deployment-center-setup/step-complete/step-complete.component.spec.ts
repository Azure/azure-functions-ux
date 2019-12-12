import { StepCompleteComponent } from './step-complete.component';
import { ComponentFixture, fakeAsync, TestBed, async, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DeploymentCenterStateManager } from '../wizard-logic/deployment-center-state-manager';
import { Injectable, Directive, HostListener } from '@angular/core';
import { BroadcastService } from '../../../../shared/services/broadcast.service';
import { LogService } from '../../../../shared/services/log.service';
import { MockLogService } from '../../../../test/mocks/log.service.mock';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { By } from '@angular/platform-browser';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { WizardForm, PythonFrameworkType } from '../wizard-logic/deployment-center-setup-models';
import { PortalResources } from '../../../../shared/models/portal-resources';
import { PortalService } from '../../../../shared/services/portal.service';
import { MockPortalService } from '../../../../test/mocks/portal.service.mock';

describe('StepCompleteComponent', () => {
  let buildStepTest: StepCompleteComponent;
  let testFixture: ComponentFixture<StepCompleteComponent>;
  let wizardService: MockDeploymentCenterStateManager;
  let logService: MockLogService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StepCompleteComponent, MockPreviousStepDirective],
      providers: [
        { provide: DeploymentCenterStateManager, useClass: MockDeploymentCenterStateManager },
        { provide: LogService, useClass: MockLogService },
        { provide: BroadcastService, useValue: new BroadcastService(null) },
        { provide: PortalService, useClass: MockPortalService },
      ],
      imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    testFixture = TestBed.createComponent(StepCompleteComponent);
    buildStepTest = testFixture.componentInstance;
    testFixture.detectChanges();

    wizardService = TestBed.get(DeploymentCenterStateManager);
    logService = TestBed.get(LogService);
  });

  describe('init', () => {
    it('should create', fakeAsync(() => {
      expect(buildStepTest).toBeTruthy();
    }));

    it('should get current resource id from wizard', fakeAsync(() => {
      wizardService.resourceIdStream$.next('test');
      expect(buildStepTest.resourceId).toBe('test');
    }));

    it('back button should trigger wizard to go back', fakeAsync(() => {
      const backButton = testFixture.debugElement.query(By.directive(MockPreviousStepDirective));
      const directiveInstance = backButton.injector.get(MockPreviousStepDirective);
      expect(directiveInstance.clicked).toBeFalsy();
      backButton.nativeElement.click();
      expect(directiveInstance.clicked).toBeTruthy();
    }));
  });

  describe('Build Group', () => {
    it('Kudu build provider should return only 2 summary groups', () => {
      wizardService.wizardValues = { ...wizardService.wizardValues, buildProvider: 'kudu' };
      expect(buildStepTest.SummaryGroups.length).toBe(2);
    });

    it('Vsts build provider should return 3 summary groups', () => {
      wizardService.wizardValues = { ...wizardService.wizardValues, buildProvider: 'vsts' };
      expect(buildStepTest.SummaryGroups.length).toBe(3);
    });

    it('create new vso account', () => {
      wizardService.wizardValues = {
        ...wizardService.wizardValues,
        buildProvider: 'vsts',
        buildSettings: {
          ...wizardService.wizardValues.buildSettings,
          createNewVsoAccount: true,
          vstsAccount: 'vstsAccount',
          vstsProject: 'vstsProject',
          location: 'Timbucktwo',
          applicationFramework: 'AspNetWap',
        },
      };
      expect(buildStepTest.SummaryGroups[1].items.length).toBe(6);
      expect(buildStepTest.SummaryGroups[1].items[0].value).toBe('vstsBuildServerTitle');
      expect(buildStepTest.SummaryGroups[1].items[1].value).toBe('yes');
      expect(buildStepTest.SummaryGroups[1].items[2].value).toBe('vstsAccount');
      expect(buildStepTest.SummaryGroups[1].items[3].value).toBe('vstsProject');
      expect(buildStepTest.SummaryGroups[1].items[4].value).toBe('Timbucktwo');
      expect(buildStepTest.SummaryGroups[1].items[5].value).toBe('AspNetWap');
    });
    it('use existing vso account', () => {
      wizardService.wizardValues = {
        ...wizardService.wizardValues,
        buildProvider: 'vsts',
        buildSettings: {
          ...wizardService.wizardValues.buildSettings,
          createNewVsoAccount: false,
          vstsAccount: 'vstsAccount',
          vstsProject: 'vstsProject',
          applicationFramework: 'AspNetWap',
        },
      };
      expect(buildStepTest.SummaryGroups[1].items.length).toBe(5);
      expect(buildStepTest.SummaryGroups[1].items[0].value).toBe('vstsBuildServerTitle');
      expect(buildStepTest.SummaryGroups[1].items[1].value).toBe('no');
      expect(buildStepTest.SummaryGroups[1].items[2].value).toBe('vstsAccount');
      expect(buildStepTest.SummaryGroups[1].items[3].value).toBe('vstsProject');
      expect(buildStepTest.SummaryGroups[1].items[4].value).toBe('AspNetWap');
    });

    it('vsts with nodejs', () => {
      wizardService.wizardValues = {
        ...wizardService.wizardValues,
        buildProvider: 'vsts',
        buildSettings: {
          ...wizardService.wizardValues.buildSettings,
          createNewVsoAccount: false,
          vstsAccount: 'vstsAccount',
          vstsProject: 'vstsProject',
          workingDirectory: '/dir/',
          nodejsTaskRunner: 'Grunt',
          applicationFramework: 'Node',
        },
      };
      expect(buildStepTest.SummaryGroups[1].items.length).toBe(7);
      expect(buildStepTest.SummaryGroups[1].items[0].value).toBe('vstsBuildServerTitle');
      expect(buildStepTest.SummaryGroups[1].items[1].value).toBe('no');
      expect(buildStepTest.SummaryGroups[1].items[2].value).toBe('vstsAccount');
      expect(buildStepTest.SummaryGroups[1].items[3].value).toBe('vstsProject');
      expect(buildStepTest.SummaryGroups[1].items[4].value).toBe('Node');
      expect(buildStepTest.SummaryGroups[1].items[5].value).toBe('/dir/');
      expect(buildStepTest.SummaryGroups[1].items[6].value).toBe('Grunt');
    });

    it('vsts with python bottle', () => {
      wizardService.wizardValues = {
        ...wizardService.wizardValues,
        buildProvider: 'vsts',
        buildSettings: {
          ...wizardService.wizardValues.buildSettings,
          createNewVsoAccount: false,
          vstsAccount: 'vstsAccount',
          vstsProject: 'vstsProject',
          workingDirectory: '/dir/',
          pythonSettings: {
            ...wizardService.wizardValues.buildSettings.pythonSettings,
            version: 'pythonversion',
            framework: PythonFrameworkType.Bottle,
          },
          applicationFramework: 'Python',
        },
      };
      expect(buildStepTest.SummaryGroups[1].items.length).toBe(8);
      expect(buildStepTest.SummaryGroups[1].items[0].value).toBe('vstsBuildServerTitle');
      expect(buildStepTest.SummaryGroups[1].items[1].value).toBe('no');
      expect(buildStepTest.SummaryGroups[1].items[2].value).toBe('vstsAccount');
      expect(buildStepTest.SummaryGroups[1].items[3].value).toBe('vstsProject');
      expect(buildStepTest.SummaryGroups[1].items[4].value).toBe('Python');
      expect(buildStepTest.SummaryGroups[1].items[5].value).toBe('/dir/');
      expect(buildStepTest.SummaryGroups[1].items[6].value).toBe('pythonversion');
      expect(buildStepTest.SummaryGroups[1].items[7].value).toBe('Bottle');
    });
    it('vsts with python flask', () => {
      wizardService.wizardValues = {
        ...wizardService.wizardValues,
        buildProvider: 'vsts',
        buildSettings: {
          ...wizardService.wizardValues.buildSettings,
          createNewVsoAccount: false,
          vstsAccount: 'vstsAccount',
          vstsProject: 'vstsProject',
          workingDirectory: '/dir/',
          pythonSettings: {
            ...wizardService.wizardValues.buildSettings.pythonSettings,
            version: 'pythonversion',
            framework: PythonFrameworkType.Flask,
            flaskProjectName: 'flaskproject',
          },
          applicationFramework: 'Python',
        },
      };
      expect(buildStepTest.SummaryGroups[1].items.length).toBe(9);
      expect(buildStepTest.SummaryGroups[1].items[0].value).toBe('vstsBuildServerTitle');
      expect(buildStepTest.SummaryGroups[1].items[1].value).toBe('no');
      expect(buildStepTest.SummaryGroups[1].items[2].value).toBe('vstsAccount');
      expect(buildStepTest.SummaryGroups[1].items[3].value).toBe('vstsProject');
      expect(buildStepTest.SummaryGroups[1].items[4].value).toBe('Python');
      expect(buildStepTest.SummaryGroups[1].items[5].value).toBe('/dir/');
      expect(buildStepTest.SummaryGroups[1].items[6].value).toBe('pythonversion');
      expect(buildStepTest.SummaryGroups[1].items[7].value).toBe('Flask');
      expect(buildStepTest.SummaryGroups[1].items[8].value).toBe('flaskproject');
    });
    it('vsts with python django', () => {
      wizardService.wizardValues = {
        ...wizardService.wizardValues,
        buildProvider: 'vsts',
        buildSettings: {
          ...wizardService.wizardValues.buildSettings,
          createNewVsoAccount: false,
          vstsAccount: 'vstsAccount',
          vstsProject: 'vstsProject',
          workingDirectory: '/dir/',
          pythonSettings: {
            ...wizardService.wizardValues.buildSettings.pythonSettings,
            version: 'pythonversion',
            framework: PythonFrameworkType.Django,
            djangoSettingsModule: 'settingsModule',
          },
          applicationFramework: 'Python',
        },
      };
      expect(buildStepTest.SummaryGroups[1].items.length).toBe(9);
      expect(buildStepTest.SummaryGroups[1].items[0].value).toBe('vstsBuildServerTitle');
      expect(buildStepTest.SummaryGroups[1].items[1].value).toBe('no');
      expect(buildStepTest.SummaryGroups[1].items[2].value).toBe('vstsAccount');
      expect(buildStepTest.SummaryGroups[1].items[3].value).toBe('vstsProject');
      expect(buildStepTest.SummaryGroups[1].items[4].value).toBe('Python');
      expect(buildStepTest.SummaryGroups[1].items[5].value).toBe('/dir/');
      expect(buildStepTest.SummaryGroups[1].items[6].value).toBe('pythonversion');
      expect(buildStepTest.SummaryGroups[1].items[7].value).toBe('Django');
      expect(buildStepTest.SummaryGroups[1].items[8].value).toBe('settingsModule');
    });
  });

  describe('Source Control Group', () => {
    it('dropbox', () => {
      wizardService.wizardValues = {
        ...wizardService.wizardValues,
        buildProvider: 'kudu',
        sourceProvider: 'dropbox',
        sourceSettings: { ...wizardService.wizardValues.sourceSettings, repoUrl: 'dropboxFolder' },
      };
      expect(buildStepTest.SummaryGroups[0].items.length).toBe(1);
      expect(buildStepTest.SummaryGroups[0].items[0].value).toBe('dropboxFolder');
    });

    it('onedrive', () => {
      wizardService.wizardValues = {
        ...wizardService.wizardValues,
        buildProvider: 'kudu',
        sourceProvider: 'onedrive',
        sourceSettings: { ...wizardService.wizardValues.sourceSettings, repoUrl: 'onedriveFolder' },
      };
      expect(buildStepTest.SummaryGroups[0].items.length).toBe(1);
      expect(buildStepTest.SummaryGroups[0].items[0].value).toBe('onedriveFolder');
    });

    it('github', () => {
      wizardService.wizardValues = {
        ...wizardService.wizardValues,
        buildProvider: 'kudu',
        sourceProvider: 'github',
        sourceSettings: { ...wizardService.wizardValues.sourceSettings, repoUrl: 'githubUrl', branch: 'githubBranch' },
      };
      expect(buildStepTest.SummaryGroups[0].items.length).toBe(2);
      expect(buildStepTest.SummaryGroups[0].items[0].value).toBe('githubUrl');
      expect(buildStepTest.SummaryGroups[0].items[1].value).toBe('githubBranch');
    });

    it('bitbucket', () => {
      wizardService.wizardValues = {
        ...wizardService.wizardValues,
        buildProvider: 'kudu',
        sourceProvider: 'bitbucket',
        sourceSettings: { ...wizardService.wizardValues.sourceSettings, repoUrl: 'bitbucketUrl', branch: 'bitbucketBranch' },
      };
      expect(buildStepTest.SummaryGroups[0].items.length).toBe(2);
      expect(buildStepTest.SummaryGroups[0].items[0].value).toBe('bitbucketUrl');
      expect(buildStepTest.SummaryGroups[0].items[1].value).toBe('bitbucketBranch');
    });

    it('external', () => {
      wizardService.wizardValues = {
        ...wizardService.wizardValues,
        buildProvider: 'kudu',
        sourceProvider: 'bitbucket',
        sourceSettings: { ...wizardService.wizardValues.sourceSettings, repoUrl: 'exUrl', branch: 'exBranch' },
      };
      expect(buildStepTest.SummaryGroups[0].items.length).toBe(2);
      expect(buildStepTest.SummaryGroups[0].items[0].value).toBe('exUrl');
      expect(buildStepTest.SummaryGroups[0].items[1].value).toBe('exBranch');
    });

    it('vsts', () => {
      wizardService.wizardValues = {
        ...wizardService.wizardValues,
        buildProvider: 'kudu',
        sourceProvider: 'vsts',
        sourceSettings: { ...wizardService.wizardValues.sourceSettings, repoUrl: 'vstsUrl', branch: 'vstsBranch' },
      };
      expect(buildStepTest.SummaryGroups[0].items.length).toBe(2);
      expect(buildStepTest.SummaryGroups[0].items[0].value).toBe('vstsUrl');
      expect(buildStepTest.SummaryGroups[0].items[1].value).toBe('vstsBranch');
    });

    it('localgit', () => {
      wizardService.wizardValues = {
        ...wizardService.wizardValues,
        buildProvider: 'kudu',
        sourceProvider: 'localgit',
        sourceSettings: { ...wizardService.wizardValues.sourceSettings },
      };
      expect(buildStepTest.SummaryGroups[0].items.length).toBe(2);
      expect(buildStepTest.SummaryGroups[0].items[0].value).toBe(PortalResources.localGitRepoMessage);
      expect(buildStepTest.SummaryGroups[0].items[1].value).toBe('master');
    });
  });
  describe('Automated Solution', () => {
    it('finish button should trigger save', fakeAsync(done => {
      const button = testFixture.debugElement.query(By.css('#step-complete-finish-button')).nativeElement;
      expect(wizardService.deployTriggered).toBeFalsy();
      button.click();
      tick();
      expect(wizardService.deployTriggered).toBeTruthy();
    }));

    it('save failures should clear busy state and log', fakeAsync(() => {
      const button = testFixture.debugElement.query(By.css('#step-complete-finish-button')).nativeElement;
      const clearBusySpy = spyOn(buildStepTest, 'clearBusy');
      const errorLogSpy = spyOn(logService, 'error');
      wizardService.fail = true;
      button.click();
      tick();
      expect(clearBusySpy).toHaveBeenCalled();
      expect(errorLogSpy).toHaveBeenCalled();
    }));
  });
});

@Injectable()
class MockDeploymentCenterStateManager {
  public wizardForm: FormGroup;
  constructor(_fb: FormBuilder) {
    this.wizardForm = _fb.group({
      sourceProvider: ['github'],
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
  public set wizardValues(values: WizardForm) {
    this.wizardForm.patchValue(values);
  }

  public resourceIdStream$ = new ReplaySubject<string>(1);
  public deployTriggered = false;
  public fail = false;
  public deploy() {
    this.deployTriggered = true;
    if (this.fail) {
      return Observable.of(null).map(x => {
        throw new Error('err');
      });
    }
    return Observable.of(null);
  }
}

@Directive({
  selector: '[previousStep]',
})
export class MockPreviousStepDirective {
  public clicked = false;
  @HostListener('click', ['$event'])
  onClick(): void {
    this.clicked = true;
  }
}
