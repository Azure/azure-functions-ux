import { Component, Input } from '@angular/core';
import { ContainerConfigureInfo, Container } from '../container-settings';
import { ContainerSettingsManager } from '../container-settings-manager';

@Component({
    selector: 'container-configure',
    templateUrl: './container-configure.component.html',
    styleUrls: ['./../container-settings.component.scss', './container-configure.component.scss']
})
export class ContainerConfigureComponent {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureInfo) {
        this.containerConfigureInfo = containerConfigureInfo;
    }

    public selectedContainer: Container;
    public containerConfigureInfo: ContainerConfigureInfo;

    constructor(private _containerSettingsManager: ContainerSettingsManager) {

        this._containerSettingsManager.selectedContainer$.subscribe((selectedContainer: Container) => {
            this.selectedContainer = selectedContainer;
        });
    }
}

export default ContainerConfigureComponent;
