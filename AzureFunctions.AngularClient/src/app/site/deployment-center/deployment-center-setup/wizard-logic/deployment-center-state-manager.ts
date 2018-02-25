import { ReplaySubject } from 'rxjs/ReplaySubject';
import { FormGroup } from '@angular/forms';
import { WizardForm } from './deployment-center-setup-models';

export class DeploymentCenterStateManager {
    public resourceIdStream = new ReplaySubject<string>(1);
    public wizardForm: FormGroup = new FormGroup({});

    public get wizardValues(): WizardForm {
        return this.wizardForm.value;
    }

    public set wizardValues(values: WizardForm) {
        this.wizardForm.patchValue(values);
    }
    public get sourceSettings(): FormGroup {
        return (this.wizardForm && (this.wizardForm.controls.sourceSettings as FormGroup)) || null;
    }

    public get buildSettings(): FormGroup {
        return (this.wizardForm && (this.wizardForm.controls.buildSettings as FormGroup)) || null;
    }

    public get testEnvironmentSettings(): FormGroup {
        return (this.wizardForm && (this.buildSettings.controls.testEnvironment as FormGroup)) || null;
    }
}
