import { Component, Input } from '@angular/core';
import { Container, ContainerSettingsData, ContainerConfigureData } from '../container-settings';
import { ContainerSettingsManager } from '../container-settings-manager';

@Component({
    selector: 'container-configure',
    templateUrl: './container-configure.component.html',
    styleUrls: ['./../container-settings.component.scss', './container-configure.component.scss']
})
export class ContainerConfigureComponent {

    @Input() set containerSettingInfoInput(containerSettingsInfo: ContainerSettingsData) {
        this.containerSettingsInfo = containerSettingsInfo;
        this.containerConfigureInfo.subscriptionId = containerSettingsInfo.subscriptionId;
        this.containerConfigureInfo.location = containerSettingsInfo.location;
    }

    public selectedContainer: Container;
    public containerSettingsInfo: ContainerSettingsData;
    public containerConfigureInfo: ContainerConfigureData;

    constructor(private _containerSettingsManager: ContainerSettingsManager) {

        this._containerSettingsManager.selectedContainer$.subscribe((selectedContainer: Container) => {
            this.selectedContainer = selectedContainer;
            this.containerConfigureInfo = { ...this.containerSettingsInfo, container: selectedContainer };
        });
    }
}

export default ContainerConfigureComponent;
