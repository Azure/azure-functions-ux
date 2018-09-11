import { Component, Input, OnDestroy, Injector } from '@angular/core';
import { ContainerConfigureData, Container, ImageSourceType } from '../container-settings';
import { ContainerSettingsManager } from '../container-settings-manager';
import { FormGroup } from '@angular/forms';
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

    public selectedContainer: Container;
    public selectedImageSource: ImageSourceType;
    public containerConfigureInfo: ContainerConfigureData;
    public containerForm: FormGroup;

    constructor(
        public containerSettingsManager: ContainerSettingsManager,
        injector: Injector) {
        super('ContainerImageSourceComponent', injector, 'dashboard');
        this.featureName = 'ContainerSettings';

        this.containerSettingsManager.form.controls.containerType.valueChanges
            .takeUntil(this.ngUnsubscribe)
            .subscribe(value => {
                this._setContainerForm(this.containerSettingsManager.containers.find(c => c.id === value));
                this._setImageSourceType();
            });
    }

    protected setup(inputEvents: Observable<ContainerConfigureData>) {
        return inputEvents
            .distinctUntilChanged()
            .do(containerConfigureInfo => {
                this.containerConfigureInfo = containerConfigureInfo;
                this._setContainerForm(containerConfigureInfo.container);
                this._setImageSourceType();
            });
    }

    public updateContainerImageSource(imageSource: ImageSourceType) {
        this.selectedImageSource  = imageSource;
        this.containerForm.controls.imageSource.setValue(imageSource);
    }

    private _setContainerForm(container: Container) {
        this.selectedContainer = container;
        this.containerForm = this.containerSettingsManager.getContainerForm(this.selectedContainer.id);
    }

    private _setImageSourceType() {
        const imageSource = this.containerForm.controls.imageSource.value;

        this.selectedImageSource = this.containerSettingsManager.containerImageSourceOptions
            .find(option => option.value === imageSource)
            .value;
    }
}
