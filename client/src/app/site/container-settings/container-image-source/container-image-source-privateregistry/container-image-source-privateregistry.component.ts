import { Component, Input, OnDestroy, Injector } from '@angular/core';
import { ContainerConfigureData, Container, ContainerType } from '../../container-settings';
import { ContainerSettingsManager } from '../../container-settings-manager';
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
export class ContainerImageSourcePrivateRegistryComponent extends FeatureComponent<ContainerConfigureData> implements OnDestroy {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureData) {
        this.setInput(containerConfigureInfo);
    }

    public selectedContainer: Container;
    public containerConfigureInfo: ContainerConfigureData;
    public form: FormGroup;

    constructor(
        private _containerSettingsManager: ContainerSettingsManager,
        injector: Injector) {
        super('ContainerImageSourcePrivateRegistryComponent', injector, 'dashboard');
        this.featureName = 'ContainerSettings';

        this._containerSettingsManager.form.controls.containerType.valueChanges
            .takeUntil(this.ngUnsubscribe)
            .subscribe((containerType: ContainerType) => {
                this._setSelectedContainer(this._containerSettingsManager.containers.find(c => c.id === containerType));
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

    private _setSelectedContainer(container: Container) {
        this.selectedContainer = container;
        this.containerConfigureInfo.container = container;

        this.form = this._containerSettingsManager.getImageSourceForm(container.id, 'privateRegistry');
    }
}
