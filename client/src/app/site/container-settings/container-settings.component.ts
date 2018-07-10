import { Component, OnDestroy, Input, Injector } from '@angular/core';
import { FeatureComponent } from '../../shared/components/feature-component';
import { TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { ContainerSettingsInput, ContainerSettingsData } from './container-settings';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'container-settings',
    templateUrl: './container-settings.component.html',
    styleUrls: ['./container-settings.component.scss']
})
export class ContainerSettingsComponent extends FeatureComponent<TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>> implements OnDestroy {

    @Input() set viewInfoInput(viewInfo: TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>) {
        this.setInput(viewInfo);
    }

    @Input() isOpenedFromMenu: boolean;

    constructor(injector: Injector) {
        super('ContainerSettingsComponent', injector);
        this.isParentComponent = true;
        this.featureName = 'ContainerSettingsComponent';
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    protected setup(inputEvents: Observable<TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>>) {
        return inputEvents
          .distinctUntilChanged()
          .do(r => {
          });
      }
}
