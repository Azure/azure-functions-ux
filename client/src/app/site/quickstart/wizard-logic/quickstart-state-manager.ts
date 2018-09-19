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

    public get devEnvironment(): FormControl {
        return (this.wizardForm && (this.wizardForm.controls.devEnvironment as FormControl)) || null;
    }

    public get workerRuntime(): FormControl {
        return (this.wizardForm && (this.wizardForm.controls.workerRuntime as FormControl)) || null;
    }

    public get portalTemplate(): FormControl {
        return (this.wizardForm && (this.wizardForm.controls.portalTemplate as FormControl)) || null;
    }

    public get deployment(): FormControl {
        return (this.wizardForm && (this.wizardForm.controls.deployment as FormControl)) || null;
    }

    public get instructions(): FormControl {
        return (this.wizardForm && (this.wizardForm.controls.instructions as FormControl)) || null;
    }

    public get context(): FormControl {
        return (this.wizardForm && (this.wizardForm.controls.context as FormControl)) || null;
    }

    public get isLinux(): FormControl {
        return (this.wizardForm && (this.wizardForm.controls.isLinux as FormControl)) || null;
    }

    public get isLinuxConsumption(): FormControl {
        return (this.wizardForm && (this.wizardForm.controls.isLinuxConsumption as FormControl)) || null;
    }

    public get subscriptionName(): FormControl {
        return (this.wizardForm && (this.wizardForm.controls.subscriptionName as FormControl)) || null;
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
