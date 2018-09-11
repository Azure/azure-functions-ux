import { Component, Input } from '@angular/core';
import { Container, ContainerConfigureData, ContinuousDeploymentOption } from '../../container-settings';
import { ContainerSettingsManager } from '../../container-settings-manager';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'container-continuous-delivery',
    templateUrl: './container-continuos-delivery.component.html',
    styleUrls: [
        './../../container-settings.component.scss',
        './container-continuos-delivery.component.scss',
    ],
})
export class ContainerContinuousDeliveryComponent {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureData) {
        this.containerConfigureInfo = containerConfigureInfo;
    }

    public selectedContainer: Container;
    public containerConfigureInfo: ContainerConfigureData;
    public selectedDeploymentOption: ContinuousDeploymentOption;
    public form: FormGroup;

    constructor(public containerSettingsManager: ContainerSettingsManager) {
        this.form = this.containerSettingsManager.form;
    }
}
