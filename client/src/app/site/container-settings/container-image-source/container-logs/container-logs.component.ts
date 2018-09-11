import { Component, Input, OnDestroy, Injector } from '@angular/core';
import { Container, ContainerConfigureData } from '../../container-settings';
import { ContainerLogsService } from '../../services/container-logs.service';
import { FeatureComponent } from '../../../../shared/components/feature-component';
import { Observable } from 'rxjs';

@Component({
    selector: 'container-logs',
    templateUrl: './container-logs.component.html',
    styleUrls: [
        './../../container-settings.component.scss',
        './container-logs.component.scss',
    ],
})
export class ContainerLogsComponent extends FeatureComponent<ContainerConfigureData> implements OnDestroy {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureData) {
        this.setInput(containerConfigureInfo);
    }

    public selectedContainer: Container;
    public containerConfigureInfo: ContainerConfigureData;
    public log = 'loading ...';

    constructor(
        private _containerLogsService: ContainerLogsService,
        injector: Injector) {
        super('ContainerLogsComponent', injector, 'dashboard');
        this.featureName = 'ContainerSettings';
    }

    protected setup(inputEvents: Observable<ContainerConfigureData>) {
        return inputEvents
            .distinctUntilChanged()
            .switchMap(containerConfigureInfo => {
                this.containerConfigureInfo = containerConfigureInfo;
                this.clearBusyEarly();

                return this._containerLogsService.getContainerLogs(containerConfigureInfo.resourceId);
            })
            .do(logResponse => {
                this.log = logResponse.result._body;
            });
    }
}
