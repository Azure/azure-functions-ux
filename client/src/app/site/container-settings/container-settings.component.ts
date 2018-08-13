import { Component, OnDestroy, Input, Injector, ViewChild } from '@angular/core';
import { FeatureComponent } from '../../shared/components/feature-component';
import { TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { ContainerSettingsInput, ContainerSettingsData, Container, ContainerConfigureInfo } from './container-settings';
import { Observable } from 'rxjs/Observable';
import { ContainerSettingsManager } from './container-settings-manager';
import { ContainerConfigureComponent } from './container-configure/container-configure.component';

@Component({
    selector: 'container-settings',
    templateUrl: './container-settings.component.html',
    styleUrls: ['./container-settings.component.scss']
})
export class ContainerSettingsComponent extends FeatureComponent<TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>> implements OnDestroy {
    @ViewChild(ContainerConfigureComponent) containerConfigureComponent: ContainerConfigureComponent;

    @Input() set viewInfoInput(viewInfo: TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>) {
        this.setInput(viewInfo);
    }

    @Input() isOpenedFromMenu: boolean;

    containerConfigureInfo: ContainerConfigureInfo;
    selectedContainer: Container;

    constructor(
        public containerSettingsManager: ContainerSettingsManager,
        injector: Injector) {
        super('ContainerSettingsComponent', injector);

        this.isParentComponent = true;
        this.featureName = 'ContainerSettingsComponent';

        this.containerSettingsManager.$selectedContainer.subscribe((selectedContainer: Container) => {
            this.selectedContainer = selectedContainer;
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    protected setup(inputEvents: Observable<TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>>) {
        return inputEvents
            .distinctUntilChanged()
            .do(r => {
                this.containerSettingsManager.resetContainers();
                this.containerSettingsManager.initialize(r.data);
                this.containerConfigureInfo = {
                    containerSettingsData: r.data.data
                };
            });
    }

    public selectContainer(container: Container) {
        this.containerSettingsManager.$selectedContainer.next(container);
    }

    public onContainerTabKeyPress(event: KeyboardEvent) {

    }
}
