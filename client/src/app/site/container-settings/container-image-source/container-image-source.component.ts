import { Component, Input } from '@angular/core';
import { ContainerConfigureInfo, Container, ImageSourceType, ContainerImageSourceInfo } from '../container-settings';
import { ContainerSettingsManager } from '../container-settings-manager';
import { SelectOption } from '../../../shared/models/select-option';

@Component({
    selector: 'container-image-source',
    templateUrl: './container-image-source.component.html',
    styleUrls: ['./../container-settings.component.scss', './container-image-source.component.scss']
})
export class ContainerImageSourceComponent {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureInfo) {
        this._containerConfigureInfo = containerConfigureInfo;
    }

    public selectedContainer: Container;
    public containerImageSourceInfo: ContainerImageSourceInfo;
    public selectedImageSource: SelectOption<ImageSourceType>;

    private _containerConfigureInfo: ContainerConfigureInfo;

    constructor(public containerSettingsManager: ContainerSettingsManager) {
        this.containerSettingsManager.selectedContainer$.subscribe((selectedContainer: Container) => {
            this.selectedContainer = selectedContainer;
            this.containerImageSourceInfo = { ...this._containerConfigureInfo, container: selectedContainer };
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
