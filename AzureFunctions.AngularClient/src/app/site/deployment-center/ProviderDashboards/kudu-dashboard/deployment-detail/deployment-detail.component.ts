import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../../../shared/models/portal-resources';
import { TableItem } from '../../../../../controls/tbl/tbl.component';
import { AiService } from '../../../../../shared/services/ai.service';
import { CacheService } from '../../../../../shared/services/cache.service';
import { BusyStateComponent } from '../../../../../busy-state/busy-state.component';
import { SimpleChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subject } from 'rxjs/Rx';
import { Deployment } from '../../../Models/deploymentData';
import { ArmArrayResult, ArmObj } from '../../../../../shared/models/arm/arm-obj';
import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { BroadcastService } from 'app/shared/services/broadcast.service';

class DeploymentDetailTableItem implements TableItem {
    public type: 'row' | 'group';
    public time: string;
    public activity: string;
    public log: string;
    public id: string;
}

interface DeploymentLogItem {
    log_time: string;
    id: string;
    message: string;
    type: number;
    details_url: string;
}
@Component({
    selector: 'app-deployment-detail',
    templateUrl: './deployment-detail.component.html',
    styleUrls: ['./deployment-detail.component.scss']
})
export class DeploymentDetailComponent implements OnChanges {
    @Input() deploymentObject: ArmObj<Deployment>;
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    @Output() closePanel = new EventEmitter();
    public viewInfoStream= new Subject<ArmObj<Deployment>>();
    private _deploymentLogFetcher = new Subject<DeploymentDetailTableItem>();

    private _tableItems: DeploymentDetailTableItem[];
    private _ngUnsubscribe = new Subject();
    public logsToShow = null;
    constructor(
        private _cacheService: CacheService,
        private _aiService: AiService,
        private _translateService: TranslateService,
        broadcastService: BroadcastService
    ) {
        this._tableItems = [];
        this.logsToShow = null;
        this._deploymentLogFetcher
            .takeUntil(this._ngUnsubscribe)
            .switchMap(item =>  this._cacheService.getArm(item.id))
            .subscribe(r => {
                const obs: ArmObj<any>[] = r.json().value;
                const message = obs.map(x => x.properties.message as string).join('\n');
                this.logsToShow = message;
            });

        this.viewInfoStream
            .takeUntil(this._ngUnsubscribe)
            .switchMap(deploymentObject => {
                this.busyState.setBusyState();
                const deploymentId = deploymentObject.id;
                return this._cacheService.getArm(`${deploymentId}/log`);
            })
            .do(null, error => {
                this.deploymentObject = null;
                this._aiService.trackEvent('/errors/deployment-center', error);
                this.busyState.clearBusyState();
            })
            .retry()
            .subscribe(r => {
                this.busyState.clearBusyState();
                const logs: ArmArrayResult<DeploymentLogItem> = r.json();
                this._tableItems = [];
                logs.value.forEach(val => {
                    const date: Date = new Date(val.properties.log_time);
                    const t = moment(date);
                    this._tableItems.push({
                        type: 'row',
                        time: t.format('h:mm:ss A'),
                        activity: val.properties.message,
                        log: val.properties.details_url,
                        id: val.id
                    });
                });
            });
    }

    get TableItems() {
        return this._tableItems || [];
    }

    redeploy() {
        //TODO Add are you sure dialog?
        this._cacheService.putArm(this.deploymentObject.id).subscribe(r => {});
        this.close();
    }

    close() {
        this.closePanel.emit();
    }

    showLogs(item: DeploymentDetailTableItem) {
        this.logsToShow = this._translateService.instant(PortalResources.resourceSelect);
       this._deploymentLogFetcher.next(item);
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['deploymentObject']) {
            if (this.deploymentObject) {
                this.viewInfoStream.next(this.deploymentObject);
            }
        }
    }
}
