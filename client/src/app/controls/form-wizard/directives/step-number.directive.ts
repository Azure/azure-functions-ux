import { Directive, Host, AfterContentInit } from '@angular/core';
import { WizardComponent } from 'app/controls/form-wizard/components/wizard.component';

@Directive({
    selector: '[StepNumber]'
})
export class StepNumberDirective implements AfterContentInit {
    constructor(@Host() private wizard: WizardComponent) {}
    ngAfterContentInit(): void {
        this.numberSteps();
        this.wizard.wizardSteps.changes.subscribe(() => {
            this.numberSteps();
        });
    }

    numberSteps() {
        this.wizard.wizardSteps.forEach((x, i) => {
            x.navigationSymbol = `${i + 1}`;
        });
    }
}
