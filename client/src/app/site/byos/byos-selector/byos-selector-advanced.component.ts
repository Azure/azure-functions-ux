import { Component, OnDestroy, Input, Injector } from '@angular/core';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { Observable } from 'rxjs/Observable';
import { ByosConfigureData } from '../byos';
import { FormGroup } from '@angular/forms';
import { ByosManager } from '../byos-manager';

@Component({
  selector: 'byos-selector-advanced',
  templateUrl: './byos-selector-advanced.component.html',
  styleUrls: ['./../byos.component.scss'],
})
export class ByosSelectorAdvancedComponent extends FeatureComponent<ByosConfigureData> implements OnDestroy {
  @Input()
  set viewInfoInput(viewInfo: ByosConfigureData) {
    this._setupForm(viewInfo.form);
    this.setInput(viewInfo);
  }

  public byosConfigureData: ByosConfigureData;
  public form: FormGroup;

  public os: string;

  constructor(private byosManager: ByosManager, injector: Injector) {
    super('ByosSelectorAdvancedComponent', injector, 'dashboard');
    this.isParentComponent = false;
    this.featureName = 'Byos';
  }

  protected setup(inputEvents: Observable<ByosConfigureData>) {
    return inputEvents.do((input: ByosConfigureData) => {
      this.byosConfigureData = input;
      this.os = input.os.toLowerCase();
      input.form.controls.basicForm.disable();
    });
  }

  private _setupForm(form: FormGroup) {
    const basicForm = this.byosManager.getBasicForm(form);
    basicForm.disable();
    this.form = this.byosManager.getAdvancedForm(form);
    this.form.enable();
  }
}
