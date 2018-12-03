import { Component, OnDestroy, Input, Injector } from '@angular/core';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { Observable } from 'rxjs/Observable';
import { ByosConfigureData } from '../byos';
import { FormGroup } from '@angular/forms';
import { ByosManager } from '../byos-manager';

@Component({
  selector: 'byos-selector',
  templateUrl: './byos-selector.component.html',
  styleUrls: ['./../byos.component.scss'],
})
export class ByosSelectorComponent extends FeatureComponent<ByosConfigureData> implements OnDestroy {
  @Input()
  set viewInfoInput(viewInfo: ByosConfigureData) {
    this.byosConfigureData = null;
    this.form = null;
    this.setInput(viewInfo);
  }

  public byosConfigureData: ByosConfigureData;
  public form: FormGroup;

  constructor(public byosManager: ByosManager, injector: Injector) {
    super('ByosSelectorComponent', injector, 'dashboard');
    this.isParentComponent = false;
    this.featureName = 'Byos';
  }

  protected setup(inputEvents: Observable<ByosConfigureData>) {
    return inputEvents.do((input: ByosConfigureData) => {
      this.byosConfigureData = input;
      this.form = input.form;
    });
  }
}
