import { Component, Input } from '@angular/core';
import { Container, ContainerSample, ContainerImageSourceInfo } from '../../container-settings';
import { ContainerSettingsManager } from '../../container-settings-manager';
import { ContainerSamplesService } from '../../../../shared/services/container-samples.service';
import { DropDownElement } from '../../../../shared/models/drop-down-element';

@Component({
    selector: 'container-image-source-quickstart',
    templateUrl: './container-image-source-quickstart.component.html',
    styleUrls: [
        './../../container-settings.component.scss',
        './../container-image-source.component.scss',
        './container-image-source-quickstart.component.scss']
})
export class ContainerImageSourceQuickstartComponent {

    @Input() set containerImageSourceInfoInput(containerImageSourceInfo: ContainerImageSourceInfo) {
        this.containerImageSourceInfo = containerImageSourceInfo;
        this.selectedContainer = containerImageSourceInfo.container;
        this._refreshSamplesList();
    }

    public selectedContainer: Container;
    public containerImageSourceInfo: ContainerImageSourceInfo;
    public samplesList: DropDownElement<string>[] = [];
    public containerSamples: ContainerSample[] = [];
    public selectedSampleValue = '';
    public selectedSampleConfig = '';
    public selectedSampleDescription = '';
    public samplesLoading = false;

    constructor(
        private _containerSettingsManager: ContainerSettingsManager,
        private _containerSampleService: ContainerSamplesService) {
        this._containerSettingsManager.selectedContainer$.subscribe((container: Container) => {
            this.selectedContainer = container;
            this._refreshSamplesList();
        });

        this._containerSettingsManager.selectedQuickstartSample$.subscribe((sample: ContainerSample) => {
            this.selectedSampleConfig = atob(sample.configBase64Encoded);
            this.selectedSampleValue = this._getContainerSampleKey(sample);
            this.selectedSampleDescription = sample.description;
        });
    }

    public sampleChanged(sample: DropDownElement<string>) {
        const selectedSampleValue = this._getContainerSampleFromKey(sample.value);
        this._containerSettingsManager.selectedQuickstartSample$.next(selectedSampleValue);
    }

    private _refreshSamplesList() {
        this.samplesLoading = true;
        this.samplesList = [];
        this._containerSampleService
            .getQuickstartSamples('linux', this.selectedContainer.id)
            .subscribe(containerSamples => {
                this.containerSamples = containerSamples;

                this.samplesList = containerSamples.map(sample => ({
                    displayLabel: sample.title,
                    value: this._getContainerSampleKey(sample),
                }));

                const sample = this._getContainerSampleFromKey(this.samplesList[0].value);
                this._containerSettingsManager.selectedQuickstartSample$.next(sample);
                this.samplesLoading = false;
            });
    }

    private _getContainerSampleKey(sample: ContainerSample): string {
        return `${sample.containerOS}_${sample.containerType}_${sample.name}`;
    }

    private _getContainerSampleFromKey(key: string): ContainerSample {
        return this.containerSamples.find(sample => this._isContainerSampleMatch(sample, key));
    }

    private _isContainerSampleMatch(sample: ContainerSample, key: string): boolean {
        const [containerOS, containerType, name] = key.split('_');

        return sample.containerOS === containerOS &&
            sample.containerType === containerType &&
            sample.name === name;
    }
}
