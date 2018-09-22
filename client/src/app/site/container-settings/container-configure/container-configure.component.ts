import { Component, Input, OnDestroy, Injector } from '@angular/core';
import { ContainerSettingsData, ContainerConfigureData } from '../container-settings';
import { FeatureComponent } from '../../../shared/components/feature-component';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'container-configure',
    templateUrl: './container-configure.component.html',
    styleUrls: ['./../container-settings.component.scss', './container-configure.component.scss'],
})
export class ContainerConfigureComponent extends FeatureComponent<ContainerSettingsData> implements OnDestroy {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureData) {
        this.setInput(containerConfigureInfo);
    }

    public containerConfigureInfo: ContainerConfigureData;

    constructor(injector: Injector) {
        super('ContainerConfigureComponent', injector, 'dashboard');
        this.featureName = 'ContainerSettings';
    }

    protected setup(inputEvents: Observable<ContainerConfigureData>) {
        return inputEvents
            .distinctUntilChanged()
            .do(containerConfigureInfo => {
                this.containerConfigureInfo = containerConfigureInfo;
            });
    }
}

export default ContainerConfigureComponent;
