import { Component, Input, OnDestroy, Injector } from '@angular/core';
import { ContainerImageSourceData } from '../../container-settings';
import { FormGroup } from '@angular/forms';
import { FeatureComponent } from '../../../../shared/components/feature-component';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'container-image-source-privateregistry',
    templateUrl: './container-image-source-privateregistry.component.html',
    styleUrls: [
        './../../container-settings.component.scss',
        './../container-image-source.component.scss',
        './container-image-source-privateregistry.component.scss',
    ],
})
export class ContainerImageSourcePrivateRegistryComponent extends FeatureComponent<ContainerImageSourceData> implements OnDestroy {

    @Input() set containerImageSourceInfoInput(containerImageSourceInfo: ContainerImageSourceData) {
        this.setInput(containerImageSourceInfo);
    }

    public containerImageSourceInfo: ContainerImageSourceData;
    public imageSourceForm: FormGroup;

    constructor(
        injector: Injector) {
        super('ContainerImageSourcePrivateRegistryComponent', injector, 'dashboard');
        this.featureName = 'ContainerSettings';
    }

    protected setup(inputEvents: Observable<ContainerImageSourceData>) {
        return inputEvents
            .distinctUntilChanged()
            .do(containerImageSourceInfo => {
                this.containerImageSourceInfo = containerImageSourceInfo;
                this.imageSourceForm = containerImageSourceInfo.imageSourceForm;
            });
    }

    public extractConfig(event) {
        const input = event.target;
        const reader = new FileReader();
        reader.onload = () => {
            this.imageSourceForm.controls.config.setValue(reader.result);
        };
        reader.readAsText(input.files[0]);
    }
}
