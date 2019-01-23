import { ConfigureExternalComponent } from './configure-external.component';
import { WizardForm } from '../../wizard-logic/deployment-center-setup-models';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Injectable } from '@angular/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DeploymentCenterStateManager } from '../../wizard-logic/deployment-center-state-manager';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { RadioSelectorComponent } from '../../../../../radio-selector/radio-selector.component';
import { TextboxComponent } from '../../../../../controls/textbox/textbox.component';

describe('ConfigureExternalComponent', () => {
  let component: ConfigureExternalComponent;
  let testFixture: ComponentFixture<ConfigureExternalComponent>;
  let wizard: MockDeploymentCenterStateManager;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigureExternalComponent, MockComponent(RadioSelectorComponent), MockComponent(TextboxComponent)],
      providers: [{ provide: DeploymentCenterStateManager, useClass: MockDeploymentCenterStateManager }, FormBuilder],
      imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    testFixture = TestBed.createComponent(ConfigureExternalComponent);
    component = testFixture.componentInstance;
    testFixture.detectChanges();
    wizard = TestBed.get(DeploymentCenterStateManager);
  });

  describe('Mercurial Switch', () => {
    it('hitting mercurial should set form isMercurial to true', () => {
      component.repoTypeChanged('Mercurial');
      expect(wizard.wizardValues.sourceSettings.isMercurial).toBeTruthy();
    });
    it('hitting Git should set form isMercurial to false', () => {
      component.repoTypeChanged('Git');
      expect(wizard.wizardValues.sourceSettings.isMercurial).toBeFalsy();
    });
  });

  describe('Form Validation', () => {
    // TODO: Form Validation
  });
});

@Injectable()
class MockDeploymentCenterStateManager {
  public wizardForm: FormGroup;
  constructor(_fb: FormBuilder) {
    this.wizardForm = _fb.group({
      sourceProvider: [null],
      buildProvider: ['kudu'],
      sourceSettings: _fb.group({
        repoUrl: [null],
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
  public get sourceSettings(): FormGroup {
    return (this.wizardForm && (this.wizardForm.controls.sourceSettings as FormGroup)) || null;
  }
}
