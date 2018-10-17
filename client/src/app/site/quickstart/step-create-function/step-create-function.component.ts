import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { devEnvironmentOptions } from 'app/site/quickstart/wizard-logic/quickstart-models';
import { Component } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'step-create-function',
  templateUrl: './step-create-function.component.html',
  styleUrls: ['./step-create-function.component.scss', '../quickstart.component.scss'],
})
export class StepCreateFunctionComponent implements OnDestroy {
  public devEnvironment: devEnvironmentOptions;
  public showPortalFunctions: boolean;

  private _ngUnsubscribe = new Subject();

  constructor(private _wizardService: QuickstartStateManager) {
    this._wizardService.devEnvironment.statusChanges.takeUntil(this._ngUnsubscribe).subscribe(() => {
      this.devEnvironment = this._wizardService.devEnvironment.value;
      this.showPortalFunctions = this.devEnvironment === 'portal';
    });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
  }
}
