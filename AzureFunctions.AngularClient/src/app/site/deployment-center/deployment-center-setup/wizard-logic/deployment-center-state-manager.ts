import { ReplaySubject } from 'rxjs/ReplaySubject';
import { FormGroup } from '@angular/forms';
import { WizardForm } from './deployment-center-setup-models';
import { Observable } from 'rxjs/Observable';
import { ArmService } from '../../../../shared/services/arm.service';

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

    public Deploy(
        _armService: ArmService,
        _resourceId: string
    ): Observable<any> {
        switch (this.wizardValues.buildProvider) {
            case 'vsts':
                return this._deployVsts();
            case 'kudu':
                return this._deployKudu(_armService, _resourceId);
            default:
                return Observable.of(null);
        }
    }

    private _deployKudu(
        _armService: ArmService,
        _resourceId: string
    ) {
        const payload = this.wizardValues.sourceSettings;
        if (this.wizardValues.sourceProvider === 'external') {
            payload.isManualIntegration = true;
        }
        return _armService.put(`${_resourceId}/sourcecontrols/web`, {
            properties: payload
        }).map(r => r.json());
    }

    private _deployVsts() {
        return Observable.of(null);
    }
}
