import { Component, Input } from '@angular/core';
import { ContainerConfigureData, Container } from '../container-settings';
import { ContainerSettingsManager } from '../container-settings-manager';

@Component({
    selector: 'container-host',
    templateUrl: './container-host.component.html',
    styleUrls: ['./../container-settings.component.scss', './container-host.component.scss']
})
export class ContainerHostComponent {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureData) {
        this.containerConfigureInfo = containerConfigureInfo;
    }

    public selectedContainer: Container;
    public containerConfigureInfo: ContainerConfigureData;

    constructor(private _containerSettingsManager: ContainerSettingsManager) {

        this._containerSettingsManager.selectedContainer$.subscribe((selectedContainer: Container) => {
            this.selectedContainer = selectedContainer;
        });
    }
}
