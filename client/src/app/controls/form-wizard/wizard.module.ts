import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';

import { WizardComponent } from './components/wizard.component';
import { WizardNavigationBarComponent } from './components/wizard-navigation-bar.component';
import { WizardStepComponent } from './components/wizard-step.component';
import { WizardCompletionStepComponent } from './components/wizard-completion-step.component';
import { ProgressBarComponent } from './components/progress-bar.component';

import { NextStepDirective } from './directives/next-step.directive';
import { PreviousStepDirective } from './directives/previous-step.directive';
import { OptionalStepDirective } from './directives/optional-step.directive';
import { GoToStepDirective } from './directives/go-to-step.directive';
import { WizardStepTitleDirective } from './directives/wizard-step-title.directive';
import { EnableBackLinksDirective } from './directives/enable-back-links.directive';
import { WizardStepDirective } from './directives/wizard-step.directive';
import { WizardCompletionStepDirective } from './directives/wizard-completion-step.directive';
import { StepNumberDirective } from './directives/step-number.directive';

/**
 * The module defining all the content inside `ng2-archwizard`
 *
 * 
MIT License

Copyright (c) 2016 madoar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*
 * @author Marc Arndt
 */
@NgModule({
    declarations: [
        WizardComponent,
        WizardStepComponent,
        WizardNavigationBarComponent,
        WizardCompletionStepComponent,
        ProgressBarComponent,
        GoToStepDirective,
        NextStepDirective,
        PreviousStepDirective,
        OptionalStepDirective,
        WizardStepTitleDirective,
        EnableBackLinksDirective,
        WizardStepDirective,
        WizardCompletionStepDirective,
        StepNumberDirective,

    ],
    imports: [CommonModule],
    exports: [
        WizardComponent,
        WizardStepComponent,
        WizardNavigationBarComponent,
        WizardCompletionStepComponent,
        ProgressBarComponent,
        GoToStepDirective,
        NextStepDirective,
        PreviousStepDirective,
        OptionalStepDirective,
        WizardStepTitleDirective,
        EnableBackLinksDirective,
        WizardStepDirective,
        WizardCompletionStepDirective,
        StepNumberDirective
    ]
})
export class WizardModule {
    /* istanbul ignore next */
    static forRoot(): ModuleWithProviders {
        return { ngModule: WizardModule, providers: [] };
    }
}
