import { TableItem } from '../../../../controls/tbl/tbl.component';
import { AiService } from '../../../../shared/services/ai.service';
import { CacheService } from '../../../../shared/services/cache.service';
import { BusyStateScopeManager } from '../../../../busy-state/busy-state-scope-manager';
import { BusyStateComponent } from '../../../../busy-state/busy-state.component';
import { SimpleChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subject } from 'rxjs/Rx';
import { Deployment } from '../../../Models/deploymentData';
import { ArmArrayResult, ArmObj } from '../../../../shared/models/arm/arm-obj';
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    ViewChild
} from '@angular/core';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import * as moment from 'moment';

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
    public viewInfoStream: Subject<ArmObj<Deployment>>;

    _viewInfoSubscription: RxSubscription;
    _busyStateScopeManager: BusyStateScopeManager;

    private _tableItems: DeploymentDetailTableItem[];

    public logsToShow;
    constructor(
        private _cacheService: CacheService,
        private _aiService: AiService
    ) {
        this._tableItems = [];
        this.viewInfoStream = new Subject<ArmObj<Deployment>>();
        this._viewInfoSubscription = this.viewInfoStream
            .distinctUntilChanged()
            .switchMap(deploymentObject => {
                // this._busyStateScopeManager.setBusy();
                const deploymentId = deploymentObject.id;
                return this._cacheService.getArm(`${deploymentId}/log`);
            })
            .do(null, error => {
                this.deploymentObject = null;
                this._aiService.trackEvent('/errors/deployment-center', error);
                this._busyStateScopeManager.clearBusy();
            })
            .retry()
            .subscribe(r => {
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

    close() {
        this.closePanel.emit();
    }
    showLogs(item: DeploymentDetailTableItem) {
        this.logsToShow = 'Loading...';
        this._cacheService.getArm(item.id).subscribe(r => {
            const obs: ArmObj<any>[] = r.json().value;
            const message = obs
                .map(x => x.properties.message as string)
                .join('\n');
            this.logsToShow = message;
        });
    }
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['deploymentObject']) {
            if (this.deploymentObject) {
                this.viewInfoStream.next(this.deploymentObject);
            }
        }
    }
}
