import { Component, Input } from '@angular/core';
import { ContainerConfigureData, Container, ImageSourceType } from '../container-settings';
import { ContainerSettingsManager } from '../container-settings-manager';
import { SelectOption } from '../../../shared/models/select-option';

@Component({
    selector: 'container-image-source',
    templateUrl: './container-image-source.component.html',
    styleUrls: ['./../container-settings.component.scss', './container-image-source.component.scss'],
})
export class ContainerImageSourceComponent {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureData) {
        this.containerConfigureInfo = containerConfigureInfo;
        this.selectedContainer = containerConfigureInfo.container;
        this.selectedImageSource = this.selectedImageSource || this.containerSettingsManager.containerImageSourceOptions[0];
    }

    public selectedContainer: Container;
    public selectedImageSource: SelectOption<ImageSourceType>;

    public containerConfigureInfo: ContainerConfigureData;

    constructor(public containerSettingsManager: ContainerSettingsManager) {
        this.containerSettingsManager.selectedContainer$.subscribe((selectedContainer: Container) => {
            this.selectedContainer = selectedContainer;
            this.containerConfigureInfo.container = selectedContainer;
        });

        this.containerSettingsManager.selectedImageSource$.subscribe((selectedImageSource: SelectOption<ImageSourceType>) => {
            this.selectedImageSource = selectedImageSource;
        });
    }

    public updateContainerImageSource(imageSource: ImageSourceType) {
        const selectedOption = this.containerSettingsManager.containerImageSourceOptions.find(item => item.value === imageSource);
        this.containerSettingsManager.selectedImageSource$.next(selectedOption);
    }
}
