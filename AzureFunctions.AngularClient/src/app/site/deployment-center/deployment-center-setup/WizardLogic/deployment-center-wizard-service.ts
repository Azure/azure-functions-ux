import { ReplaySubject } from 'rxjs/ReplaySubject';
import { FormGroup } from '@angular/forms';

export class DeploymentCenterWizardService {

    public resourceIdStream = new ReplaySubject<string>(1);
    public wizardForm: FormGroup = new FormGroup({});

    public get sourceSettings() : FormGroup{
        return (this.wizardForm && this.wizardForm.controls.sourceSettings as FormGroup) || null;
    }
}
