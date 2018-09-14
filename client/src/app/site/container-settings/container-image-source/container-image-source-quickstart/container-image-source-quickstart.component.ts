import { Component, Input, OnDestroy, Injector } from '@angular/core';
import { ContainerSample, ContainerImageSourceData } from '../../container-settings';
import { ContainerSamplesService } from '../../services/container-samples.service';
import { DropDownElement } from '../../../../shared/models/drop-down-element';
import { FormGroup } from '@angular/forms';
import { FeatureComponent } from '../../../../shared/components/feature-component';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'container-image-source-quickstart',
    templateUrl: './container-image-source-quickstart.component.html',
    styleUrls: [
        './../../container-settings.component.scss',
        './../container-image-source.component.scss',
        './container-image-source-quickstart.component.scss',
    ],
})
export class ContainerImageSourceQuickstartComponent extends FeatureComponent<ContainerImageSourceData> implements OnDestroy {

    @Input() set containerImageSourceInfoInput(containerImageSourceInfo: ContainerImageSourceData) {
        this.setInput(containerImageSourceInfo);
    }

    public containerImageSourceInfo: ContainerImageSourceData;
    public samplesList: DropDownElement<string>[] = [];
    public containerSamples: ContainerSample[] = [];
    public selectedSampleValue = '';
    public selectedSampleDescription = '';
    public samplesLoading = false;
    public imageSourceForm: FormGroup;

    constructor(
        private _containerSampleService: ContainerSamplesService,
        injector: Injector) {
        super('ContainerImageSourceQuickstartComponent', injector, 'dashboard');
        this.featureName = 'ContainerSettings';
    }

    public sampleChanged(sample: DropDownElement<string>) {
        const selectedSample = this._getContainerSampleFromKey(sample.value);
        this.selectedSampleDescription = selectedSample.description;
        this.imageSourceForm.controls.config.setValue(atob(selectedSample.configBase64Encoded));
    }

    protected setup(inputEvents: Observable<ContainerImageSourceData>) {
        return inputEvents
            .distinctUntilChanged()
            .switchMap(containerImageSourceInfo => {
                this.containerImageSourceInfo = containerImageSourceInfo;
                this.imageSourceForm = containerImageSourceInfo.imageSourceForm;

                return this._containerSampleService
                    .getQuickstartSamples(this.containerImageSourceInfo.os, this.containerImageSourceInfo.container.id);
            })
            .do(containerSamples => {
                this.containerSamples = containerSamples;

                this.samplesList = containerSamples.map(sample => ({
                    displayLabel: sample.title,
                    value: this._getContainerSampleKey(sample),
                }));

                this.samplesLoading = false;
                if (containerSamples.length > 0) {
                    this.selectedSampleValue = this.samplesList[0].value;
                    this.selectedSampleDescription = containerSamples[0].description;
                    this.imageSourceForm.controls.config.setValue(atob(this.containerSamples[0].configBase64Encoded));
                }
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
