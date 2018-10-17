import { BusyStateComponent } from './../../../busy-state/busy-state.component';
import { DynamicLoaderDirective } from './../../../shared/directives/dynamic-loader.directive';
import { Component, OnChanges, Input, Type, ViewChild, ComponentFactoryResolver, SimpleChange } from '@angular/core';

@Component({
  selector: 'site-tab',
  template: `
      <div *ngIf="initialized">
        <div [hidden]="!active"
          [id]="'site-tab-content-' + id"
          [attr.aria-label]="title"
          role="tabpanel">

          <busy-state [name]="id" cssClass="busy-site-tabs"></busy-state>
          <ng-template *ngIf="componentFactory" dynamic-loader></ng-template>
        </div>
    </div>`,
})
export class SiteTabComponent implements OnChanges {
  @ViewChild(BusyStateComponent)
  busyState: BusyStateComponent;

  // initialized is important because it ensures that we don't load any content or child components until the
  // tab gets inputs for the first time.  Once initialized, it ensures that we also don't reinitialize
  // the content if someone navigates away and comes back.
  public initialized = false;

  @Input()
  title: string;

  @Input()
  id: string;

  @Input()
  active: boolean;

  @Input()
  closeable: boolean;

  @Input()
  iconUrl: string;

  @Input()
  componentFactory: Type<any>;

  @Input()
  componentInput: { [key: string]: any };

  private _previousInput: { [key: string]: any };

  @ViewChild(DynamicLoaderDirective)
  dynamicLoader: DynamicLoaderDirective;

  private _componentRef: any;

  constructor(private _componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    // Making sure that we don't update the component loading or inputs unless
    // we're currently the active tab
    if (this.componentFactory && this.componentInput && Object.keys(this.componentInput).length > 0 && this.active) {
      this.initialized = true;

      if (!this._componentRef) {
        // Calling timeout to ensure that Angular has a chance to read the dynamic loader directive and load it
        setTimeout(() => {
          if (this.dynamicLoader) {
            const componentFactory = this._componentFactoryResolver.resolveComponentFactory(this.componentFactory);
            const viewContainerRef = this.dynamicLoader.viewContainerRef;
            viewContainerRef.clear();

            this._componentRef = viewContainerRef.createComponent(componentFactory);
            this._setComponentInputs(this.componentInput);
          }
        });
      } else if (this._previousInput !== this.componentInput) {
        this._setComponentInputs(this.componentInput);
      }

      this._previousInput = this.componentInput;
    }
  }

  private _setComponentInputs(inputs: any) {
    for (const key in this.componentInput) {
      if (this.componentInput.hasOwnProperty(key)) {
        this._componentRef.instance[key] = this.componentInput[key];
      }
    }
  }
}
