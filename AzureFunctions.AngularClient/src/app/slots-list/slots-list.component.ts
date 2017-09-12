import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import { TreeViewInfo } from './../tree-view/models/tree-view-info';
import { SlotsNode } from '../tree-view/slots-node';
import { SlotNode } from '../tree-view/app-node';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { PortalResources } from '../shared/models/portal-resources';
import { ErrorType, ErrorEvent } from '../shared/models/error-event';
import { ErrorIds } from '../shared/models/error-ids';


interface SlotItem {
    name: string;
    status: string;
    serverFarm: string;
    node: SlotNode;
}

@Component({
    selector: 'slots-list',
    templateUrl: './slots-list.component.html',
    styleUrls: ['./slots-list.component.scss']
})
export class SlotsListComponent implements OnDestroy {
    public slots: SlotItem[] = [];
    public isLoading: boolean;

    private _slotsNode: SlotsNode;
    private _ngUnsubscribe = new Subject();

    constructor(
        private _broadcastService: BroadcastService,
        private _translateService: TranslateService
    ) {

        this._broadcastService.getEvents<TreeViewInfo<any>>(BroadcastEvent.SlotsDashboard)
            .takeUntil(this._ngUnsubscribe)
            .switchMap(viewInfo => {
                this.isLoading = true;
                this._slotsNode = (<SlotsNode>viewInfo.node);
                return this._slotsNode.loadChildren();
            })
            .do(null, e =>{
                this.isLoading = false;
                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                    message: this._translateService.instant(PortalResources.error_unableToLoadSlotsList),
                    errorType: ErrorType.RuntimeError,
                    errorId: ErrorIds.unableToPopulateSlotsList,
                    resourceId: 'none'
                });
            })
            .retry()
            .subscribe(() => {
                this.isLoading = false;
                this.slots = (<SlotNode[]>this._slotsNode.children)
                    .map(s => {
                        return <SlotItem>{
                            name: s.title,
                            status: s.slotProperties.state,
                            serverFarm: s.slotProperties.serverFarmId.split('/')[8],
                            node: s
                        };
                    });
            });
    }

    ngOnDestroy() {
        this._ngUnsubscribe.next();
    }

    clickRow(item: SlotItem) {
        item.node.select();
    }

}
