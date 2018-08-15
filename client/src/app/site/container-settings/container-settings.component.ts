import { Component, OnDestroy, Input, Injector, ViewChild, ElementRef } from '@angular/core';
import { FeatureComponent } from '../../shared/components/feature-component';
import { TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { ContainerSettingsInput, ContainerSettingsData, Container, ContainerConfigureInfo } from './container-settings';
import { Observable } from 'rxjs/Observable';
import { ContainerSettingsManager } from './container-settings-manager';
import { ContainerConfigureComponent } from './container-configure/container-configure.component';
import { KeyCodes } from '../../shared/models/constants';
import { Dom } from '../../shared/Utilities/dom';

@Component({
    selector: 'container-settings',
    templateUrl: './container-settings.component.html',
    styleUrls: ['./container-settings.component.scss']
})
export class ContainerSettingsComponent extends FeatureComponent<TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>> implements OnDestroy {
    @ViewChild(ContainerConfigureComponent) containerConfigureComponent: ContainerConfigureComponent;
    @ViewChild('containerSettingsTabs') containerSettingsTabs: ElementRef;

    @Input() set viewInfoInput(viewInfo: TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>) {
        this.setInput(viewInfo);
    }

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
        const containers = this.containerSettingsManager.containers;
        if (event.keyCode === KeyCodes.arrowRight || event.keyCode === KeyCodes.arrowLeft) {
            let curIndex = containers.findIndex(container => container === this.selectedContainer);
            const tabElements = this._getTabElements();
            this._updateContainerFocusTab(false, tabElements, curIndex);

            if (event.keyCode === KeyCodes.arrowRight) {
                curIndex = this._getTargetIndex(containers, curIndex + 1);
            } else {
                curIndex = this._getTargetIndex(containers, curIndex - 1);
            }

            this.selectContainer(containers[curIndex]);
            this._updateContainerFocusTab(true, tabElements, curIndex);

            event.preventDefault();
        }
    }

    private _getTargetIndex(containers: Container[], targetIndex: number) {
        if (targetIndex < 0) {
            targetIndex = containers.length - 1;
        } else if (targetIndex >= containers.length) {
            targetIndex = 0;
        }

        return targetIndex;
    }

    private _getTabElements() {
        return this.containerSettingsTabs.nativeElement.children;
    }

    private _updateContainerFocusTab(set: boolean, elements: HTMLCollection, index: number) {
        const tab = Dom.getTabbableControl(<HTMLElement>elements[index]);

        if (set) {
            Dom.setFocus(tab);
        } else {
            Dom.clearFocus(tab);
        }
    }
}
