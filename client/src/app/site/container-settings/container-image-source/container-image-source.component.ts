import { Component, Input, OnDestroy, Injector } from '@angular/core';
import { ContainerConfigureData, ImageSourceType, ContainerImageSourceData } from '../container-settings';
import { ContainerSettingsManager } from '../container-settings-manager';
import { FeatureComponent } from '../../../shared/components/feature-component';
import { Observable } from 'rxjs';

@Component({
    selector: 'container-image-source',
    templateUrl: './container-image-source.component.html',
    styleUrls: ['./../container-settings.component.scss', './container-image-source.component.scss'],
})
export class ContainerImageSourceComponent extends FeatureComponent<ContainerConfigureData> implements OnDestroy {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureData) {
        this.setInput(containerConfigureInfo);
    }

    public selectedImageSource: ImageSourceType;
    public containerImageSourceInfo: ContainerImageSourceData;
    public containerConfigureInfo: ContainerConfigureData;

    constructor(
        public containerSettingsManager: ContainerSettingsManager,
        injector: Injector) {
        super('ContainerImageSourceComponent', injector, 'dashboard');
        this.featureName = 'ContainerSettings';
    }

    protected setup(inputEvents: Observable<ContainerConfigureData>) {
        return inputEvents
            .distinctUntilChanged()
            .do(containerConfigureInfo => {
                this.selectedImageSource = containerConfigureInfo.containerForm.controls.imageSource.value;
                this.containerConfigureInfo = containerConfigureInfo;
                const imageSourceForm = this.containerSettingsManager.getImageSourceForm(
                    containerConfigureInfo.containerForm,
                    this.selectedImageSource);

                this.containerImageSourceInfo = { ...containerConfigureInfo, imageSourceForm: imageSourceForm };
            });
    }

    public updateContainerImageSource(imageSource: ImageSourceType) {
        const imageSourceForm = this.containerSettingsManager.getImageSourceForm(
            this.containerImageSourceInfo.containerForm,
            imageSource);

        this.containerImageSourceInfo.imageSourceForm = imageSourceForm;
        this.selectedImageSource  = imageSource;
    }
}
