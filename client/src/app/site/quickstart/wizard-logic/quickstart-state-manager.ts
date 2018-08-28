import { FormGroup, FormControl } from '@angular/forms';
import { WizardForm } from './quickstart-models';
import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class QuickstartStateManager implements OnDestroy {

    public wizardForm: FormGroup = new FormGroup({});
    private _ngUnsubscribe$ = new Subject();
    constructor() {
    }

    public get wizardValues(): WizardForm {
        return this.wizardForm.value;
    }

    public set wizardValues(values: WizardForm) {
        this.wizardForm.patchValue(values);
    }

    ngOnDestroy(): void {
        this._ngUnsubscribe$.next();
    }

    resetSection(formGroup: FormGroup) {
        formGroup.reset();
    }

    public get devEnvironment(): FormGroup {
        return (this.wizardForm && (this.wizardForm.controls.devEnvironment as FormGroup)) || null;
    }

    public get workerRuntime(): FormGroup {
        return (this.wizardForm && (this.wizardForm.controls.workerRuntime as FormGroup)) || null;
    }

    public get portalTemplate(): FormGroup {
        return (this.wizardForm && (this.wizardForm.controls.portalTemplate as FormGroup)) || null;
    }

    public get deployment(): FormGroup {
        return (this.wizardForm && (this.wizardForm.controls.deployment as FormGroup)) || null;
    }

    public get instructions(): FormGroup {
        return (this.wizardForm && (this.wizardForm.controls.instructions as FormGroup)) || null;
    }

    public get context(): FormGroup {
        return (this.wizardForm && (this.wizardForm.controls.context as FormGroup)) || null;
    }

    public get isLinux(): FormGroup {
        return (this.wizardForm && (this.wizardForm.controls.isLinux as FormGroup)) || null;
    }

    public get isLinuxConsumption(): FormGroup {
        return (this.wizardForm && (this.wizardForm.controls.isLinuxConsumption as FormGroup)) || null;
    }

    markSectionAsTouched(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            if (control instanceof FormControl && !control.touched && !control.dirty) {
                control.markAsTouched();
                control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
            } else if (control instanceof FormGroup) {
                this.markSectionAsTouched(control);
            }
        });
    }
}
