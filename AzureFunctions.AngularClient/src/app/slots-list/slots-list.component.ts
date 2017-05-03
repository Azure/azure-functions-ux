import { Component, OnInit } from '@angular/core';
import { Subject, Subscription as RxSubscription } from 'rxjs/Rx';
import { TreeViewInfo } from './../tree-view/models/tree-view-info';
import { SlotsNode } from "../tree-view/slots-node";
import { SlotNode } from "../tree-view/app-node";
import { BroadcastService } from "app/shared/services/broadcast.service";
import { BroadcastEvent } from "app/shared/models/broadcast-event";
import { PortalResources } from "app/shared/models/portal-resources";
import { ErrorType, ErrorEvent } from "app/shared/models/error-event";
import { ErrorIds } from "app/shared/models/error-ids";
import { TranslateService } from "@ngx-translate/core";


interface SlotItem {
    name: string,
    status: string,
    serverFarm: string,
    node: SlotNode
}

@Component({
    selector: 'slots-list',
    templateUrl: './slots-list.component.html',
    styleUrls: ['./slots-list.component.scss'],
    inputs: ['viewInfoInput']
})
export class SlotsListComponent implements OnInit {
    public viewInfoStream: Subject<TreeViewInfo>;
    public slots: SlotItem[] = [];
    public isLoading: boolean;

    private _slotsNode: SlotsNode;
    private _viewInfoSubscription: RxSubscription;

    constructor(
        private _broadcastService: BroadcastService,
        private _translateService: TranslateService
    ) {
        this.viewInfoStream = new Subject<TreeViewInfo>();

        this._viewInfoSubscription = this.viewInfoStream.distinctUntilChanged()
            .switchMap(viewInfo => {
                this.isLoading = true;
                this._slotsNode = (<SlotsNode>viewInfo.node);
                return this._slotsNode.loadChildren();
            })
            .subscribe(() => {
                this.isLoading = false;
                this.slots = (<SlotNode[]>this._slotsNode.children)
                    .map(s => {
                        return <SlotItem>{
                            name: s.title,
                            status: s.slotProperties.state,
                            serverFarm: s.slotProperties.serverFarmId.split('/')[8],
                            node: s
                        }
                    });
            }, (err => {
                this.isLoading = false;
                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                    message: this._translateService.instant(PortalResources.error_unableToLoadSlotsList),
                    errorType: ErrorType.RuntimeError,
                    errorId: ErrorIds.unableToPopulateSlotsList
                });
            }))
    }

    ngOnInit() {
    }

    set viewInfoInput(viewInfo: TreeViewInfo) {
        this.viewInfoStream.next(viewInfo);
    }

    clickRow(item: SlotItem) {
        item.node.select();
    }

}
