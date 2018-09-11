import { Component, Input } from '@angular/core';
import { Container, ContainerSample, ContainerConfigureData, ContainerType } from '../../container-settings';
import { ContainerSettingsManager } from '../../container-settings-manager';
import { ContainerSamplesService } from '../../services/container-samples.service';
import { DropDownElement } from '../../../../shared/models/drop-down-element';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'container-image-source-quickstart',
    templateUrl: './container-image-source-quickstart.component.html',
    styleUrls: [
        './../../container-settings.component.scss',
        './../container-image-source.component.scss',
        './container-image-source-quickstart.component.scss',
    ],
})
export class ContainerImageSourceQuickstartComponent {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureData) {
        this.containerConfigureInfo = containerConfigureInfo;
        this._setSelectedContainer(containerConfigureInfo.container);
        this._refreshSamplesList();
    }

    public selectedContainer: Container;
    public containerConfigureInfo: ContainerConfigureData;
    public samplesList: DropDownElement<string>[] = [];
    public containerSamples: ContainerSample[] = [];
    public selectedSampleValue = '';
    public selectedSampleDescription = '';
    public samplesLoading = false;
    public form: FormGroup;

    constructor(
        private _containerSettingsManager: ContainerSettingsManager,
        private _containerSampleService: ContainerSamplesService) {
        this._containerSettingsManager.form.controls.containerType.valueChanges.subscribe((containerType: ContainerType) => {
            this._setSelectedContainer(this._containerSettingsManager.containers.find(c => c.id === containerType));
            this._refreshSamplesList();
        });
    }

    public sampleChanged(sample: DropDownElement<string>) {
        const selectedSample = this._getContainerSampleFromKey(sample.value);
        this.form.controls.config.setValue(atob(selectedSample.configBase64Encoded));
    }

    private _refreshSamplesList() {
        this.samplesLoading = true;
        this.samplesList = [];
        this._containerSampleService
            .getQuickstartSamples(this.containerConfigureInfo.os, this.selectedContainer.id)
            .subscribe(containerSamples => {
                this.containerSamples = containerSamples;

                this.samplesList = containerSamples.map(sample => ({
                    displayLabel: sample.title,
                    value: this._getContainerSampleKey(sample),
                }));

                this.samplesLoading = false;
                this.selectedSampleValue = this.samplesList[0].value;
                this.form.controls.config.setValue(atob(this.containerSamples[0].configBase64Encoded));
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

    private _setSelectedContainer(container: Container) {
        this.selectedContainer = container;
        this.containerConfigureInfo.container = container;
        this.form = this._containerSettingsManager.getImageSourceForm(container.id, 'quickstart');
    }
}
