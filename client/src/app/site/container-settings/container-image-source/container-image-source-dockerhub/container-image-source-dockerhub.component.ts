import { Component, Input, OnDestroy, Injector } from '@angular/core';
import { ContainerConfigureData, Container, DockerHubAccessType, ContainerType } from '../../container-settings';
import { ContainerSettingsManager } from '../../container-settings-manager';
import { FormGroup } from '@angular/forms';
import { FeatureComponent } from '../../../../shared/components/feature-component';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'container-image-source-dockerhub',
    templateUrl: './container-image-source-dockerhub.component.html',
    styleUrls: [
        './../../container-settings.component.scss',
        './../container-image-source.component.scss',
        './container-image-source-dockerhub.component.scss',
    ],
})
export class ContainerImageSourceDockerHubComponent extends FeatureComponent<ContainerConfigureData> implements OnDestroy {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureData) {
        this.setInput(containerConfigureInfo);
    }

    public selectedContainer: Container;
    public containerConfigureInfo: ContainerConfigureData;
    public selectedAccessType: DockerHubAccessType;
    public form: FormGroup;

    private _imageSourceForm: FormGroup;

    constructor(
        public containerSettingsManager: ContainerSettingsManager,
        injector: Injector) {
        super('ContainerImageSourceDockerHubComponent', injector, 'dashboard');
        this.featureName = 'ContainerSettings';

        this.containerSettingsManager.form.controls.containerType.valueChanges
            .takeUntil(this.ngUnsubscribe)
            .subscribe((containerType: ContainerType) => {
                this._setSelectedContainer(this.containerSettingsManager.containers.find(c => c.id === containerType));
            });
    }

    protected setup(inputEvents: Observable<ContainerConfigureData>) {
        return inputEvents
            .distinctUntilChanged()
            .do(containerConfigureInfo => {
                this.containerConfigureInfo = containerConfigureInfo;
                this._setSelectedContainer(containerConfigureInfo.container);
            });
    }

    public extractConfig(event) {
        const input = event.target;
        const reader = new FileReader();
        reader.onload = () => {
            this.form.controls.config.setValue(reader.result);
        };
        reader.readAsText(input.files[0]);
    }

    public updateAccessOptions(accessType: DockerHubAccessType) {
        this.selectedAccessType = accessType;
        this._imageSourceForm.controls.accessType.setValue(accessType);
        this.form = this.containerSettingsManager.getDockerHubForm(
            this.selectedContainer.id,
            'dockerHub',
            accessType);
    }

    private _setSelectedContainer(container: Container) {
        this.selectedContainer = container;
        this.containerConfigureInfo.container = container;

        this._imageSourceForm = this.containerSettingsManager.getImageSourceForm(container.id, 'dockerHub');
        this.form = this.containerSettingsManager.getDockerHubForm(
            container.id,
            'dockerHub',
            this._imageSourceForm.controls.accessType.value);

        this.selectedAccessType = this._imageSourceForm.controls.accessType.value;
    }
}
