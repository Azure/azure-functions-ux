import { Component, Input, OnDestroy, Injector } from '@angular/core';
import { Container, ContainerSettingsData, ContainerConfigureData } from '../container-settings';
import { ContainerSettingsManager } from '../container-settings-manager';
import { FormGroup } from '@angular/forms';
import { FeatureComponent } from '../../../shared/components/feature-component';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'container-configure',
    templateUrl: './container-configure.component.html',
    styleUrls: ['./../container-settings.component.scss', './container-configure.component.scss'],
})
export class ContainerConfigureComponent extends FeatureComponent<ContainerSettingsData> implements OnDestroy {

    @Input() set containerSettingInfoInput(containerSettingsInfo: ContainerSettingsData) {
        this.setInput(containerSettingsInfo);
    }

    public selectedContainer: Container;
    public containerSettingsInfo: ContainerSettingsData;
    public containerConfigureInfo: ContainerConfigureData;
    private _form: FormGroup;

    constructor(
        private _containerSettingsManager: ContainerSettingsManager,
        injector: Injector) {
        super('ContainerConfigureComponent', injector, 'dashboard');
        this.featureName = 'ContainerSettings';

        this._form = this._containerSettingsManager.form;
        this._setSelectedContainer();

        this._form.controls.containerType.statusChanges.subscribe(value => {
            this._setSelectedContainer();
            this.containerConfigureInfo = { ...this.containerSettingsInfo, container: this.selectedContainer };
        });
    }

    protected setup(inputEvents: Observable<ContainerSettingsData>) {
        return inputEvents
            .distinctUntilChanged()
            .do(containerSettingsInfo => {
                this.containerSettingsInfo = containerSettingsInfo;
                this.containerConfigureInfo = { ...containerSettingsInfo, container: this.selectedContainer };
            });
    }

    private _setSelectedContainer() {
        this.selectedContainer = this._containerSettingsManager.containers.find(
            c => c.id === this._form.controls.containerType.value);
    }
}

export default ContainerConfigureComponent;
