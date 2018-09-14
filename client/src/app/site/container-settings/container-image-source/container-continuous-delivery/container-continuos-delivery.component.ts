import { Component, Input, OnDestroy, Injector } from '@angular/core';
import { ContainerConfigureData, ContinuousDeploymentOption } from '../../container-settings';
import { ContainerSettingsManager } from '../../container-settings-manager';
import { FormGroup } from '@angular/forms';
import { FeatureComponent } from '../../../../shared/components/feature-component';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'container-continuous-delivery',
    templateUrl: './container-continuos-delivery.component.html',
    styleUrls: [
        './../../container-settings.component.scss',
        './container-continuos-delivery.component.scss',
    ],
})
export class ContainerContinuousDeliveryComponent extends FeatureComponent<ContainerConfigureData> implements OnDestroy {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureData) {
        this.setInput(containerConfigureInfo);
    }

    public containerConfigureInfo: ContainerConfigureData;
    public selectedDeploymentOption: ContinuousDeploymentOption;
    public form: FormGroup;

    constructor(
        public containerSettingsManager: ContainerSettingsManager,
        injector: Injector) {
        super('ContainerContinuousDeliveryComponent', injector, 'dashboard');
        this.featureName = 'ContainerSettings';
    }

    protected setup(inputEvents: Observable<ContainerConfigureData>) {
        return inputEvents
            .distinctUntilChanged()
            .do(containerConfigureInfo => {
                this.containerConfigureInfo = containerConfigureInfo;
                this.form = containerConfigureInfo.form;
            });
    }
}
