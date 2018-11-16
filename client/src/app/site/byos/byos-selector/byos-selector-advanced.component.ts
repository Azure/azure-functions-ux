import { Component, OnDestroy, Input, Injector } from '@angular/core';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { Observable } from 'rxjs/Observable';
import { ByosConfigureData } from '../byos';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'byos-selector-advanced',
  templateUrl: './byos-selector-advanced.component.html',
  styleUrls: ['./../byos.component.scss'],
})
export class ByosSelectorAdvancedComponent extends FeatureComponent<ByosConfigureData> implements OnDestroy {
  @Input()
  set viewInfoInput(viewInfo: ByosConfigureData) {
    this.setInput(viewInfo);
  }

  public byosConfigureData: ByosConfigureData;
  public form: FormGroup;

  constructor(injector: Injector) {
    super('ByosSelectorAdvancedComponent', injector, 'dashboard');
    this.isParentComponent = false;
    this.featureName = 'Byos';
  }

  protected setup(inputEvents: Observable<ByosConfigureData>) {
    return inputEvents.do((input: ByosConfigureData) => {
      this.byosConfigureData = input;
      this.form = <FormGroup>(input.form && input.form.controls && input.form.controls.advancedForm);
      this.form.enable();
      input.form.controls.basicForm.disable();
    });
  }
}
