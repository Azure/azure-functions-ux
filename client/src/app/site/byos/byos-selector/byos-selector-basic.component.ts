import { Component, OnDestroy, Input, Injector } from '@angular/core';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { Observable } from 'rxjs/Observable';
import { ByosConfigureData } from '../byos';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'byos-selector-basic',
  templateUrl: './byos-selector-basic.component.html',
  styleUrls: ['./../byos.component.scss'],
})
export class ByosSelectorBasicComponent extends FeatureComponent<ByosConfigureData> implements OnDestroy {
  @Input()
  set viewInfoInput(viewInfo: ByosConfigureData) {
    this.setInput(viewInfo);
  }

  public byosConfigureData: ByosConfigureData;
  public form: FormGroup;
  public loadingAccounts = false;
  public loading;

  constructor(injector: Injector) {
    super('ByosSelectorBasicComponent', injector, 'dashboard');
    this.isParentComponent = false;
    this.featureName = 'Byos';
  }

  protected setup(inputEvents: Observable<ByosConfigureData>) {
    return inputEvents.do((input: ByosConfigureData) => {
      this.byosConfigureData = input;
      this.form = <FormGroup>(input.form && input.form.controls && input.form.controls.basicForm);
      this.form.enable();
      input.form.controls.advancedForm.disable();
    });
  }
}
