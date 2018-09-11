import { Component, Input } from '@angular/core';
import { Container, ContainerConfigureData } from '../../container-settings';
import { ContainerLogsService } from '../../services/container-logs.service';

@Component({
    selector: 'container-logs',
    templateUrl: './container-logs.component.html',
    styleUrls: [
        './../../container-settings.component.scss',
        './container-logs.component.scss',
    ],
})
export class ContainerLogsComponent {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureData) {
        this.containerConfigureInfo = containerConfigureInfo;
        this._loadLogs();
    }

    public selectedContainer: Container;
    public containerConfigureInfo: ContainerConfigureData;
    public log = 'loading ...';

    constructor(private _containerLogsService: ContainerLogsService) {
    }

    private _loadLogs() {
        this._containerLogsService
            .getContainerLogs(this.containerConfigureInfo.resourceId)
            .subscribe(logResponse => {
                this.log = logResponse.result._body;
            });
    }
}
