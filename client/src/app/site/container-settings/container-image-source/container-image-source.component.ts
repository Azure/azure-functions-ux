import { Component, Input } from '@angular/core';
import { ContainerConfigureInfo, Container, ImageSourceType } from '../container-settings';
import { ContainerSettingsManager } from '../container-settings-manager';
import { SelectOption } from '../../../shared/models/select-option';

@Component({
    selector: 'container-image-source',
    templateUrl: './container-image-source.component.html',
    styleUrls: ['./../container-settings.component.scss', './container-image-source.component.scss']
})
export class ContainerImageSourceComponent {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureInfo) {
        this.containerConfigureInfo = containerConfigureInfo;
    }

    public selectedContainer: Container;
    public containerConfigureInfo: ContainerConfigureInfo;
    public selectedImageSource: SelectOption<ImageSourceType>;

    constructor(public containerSettingsManager: ContainerSettingsManager) {
        this.containerSettingsManager.$selectedContainer.subscribe((selectedContainer: Container) => {
            this.selectedContainer = selectedContainer;
        });

        this.containerSettingsManager.$selectedImageSource.subscribe((selectedImageSource: SelectOption<ImageSourceType>) => {
            this.selectedImageSource = selectedImageSource;
        })
    }

    public updateContainerImageSource(imageSource: ImageSourceType) {
        const selectedOption = this.containerSettingsManager.containerImageSourceOptions.find(item => item.value === imageSource);
        this.containerSettingsManager.$selectedImageSource.next(selectedOption);
    }
}
