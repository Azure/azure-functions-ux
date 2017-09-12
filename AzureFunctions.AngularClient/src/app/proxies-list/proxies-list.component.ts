import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ProxyNode } from './../tree-view/proxy-node';
import { ProxiesNode } from './../tree-view/proxies-node';
import { TreeViewInfo } from './../tree-view/models/tree-view-info';

interface ProxyItem {
  name: string;
  url: string;
  node: ProxyNode;
}

@Component({
  selector: 'proxies-list',
  templateUrl: './proxies-list.component.html',
  styleUrls: ['./proxies-list.component.scss']
})
export class ProxiesListComponent implements OnDestroy {
  public viewInfoStream: Subject<TreeViewInfo<any>>;
  public proxies: ProxyItem[] = [];
  public isLoading: boolean;

  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  private _proxiesNode: ProxiesNode;

  constructor(private _broadcastService: BroadcastService) {
    this.viewInfoStream = new Subject<TreeViewInfo<any>>();

    this._broadcastService.getEvents<TreeViewInfo<any>>(BroadcastEvent.ProxiesDashboard)
      .takeUntil(this._ngUnsubscribe)
      .distinctUntilChanged()
      .switchMap(viewInfo => {
        this.isLoading = true;
        this._proxiesNode = (<ProxiesNode>viewInfo.node);
        return this._proxiesNode.loadChildren();
      })
      .subscribe(() => {
        this.isLoading = false;
        this.proxies = (<ProxyNode[]>this._proxiesNode.children)
          .map(p => {
            return <ProxyItem>{
              name: p.title,
              url: p.proxy.backendUri,
              node: p
            };
          });
      });
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe.next();
  }

  set viewInfoInput(viewInfo: TreeViewInfo<any>) {
    this.viewInfoStream.next(viewInfo);
  }

  clickRow(item: ProxyItem) {
    item.node.select();
  }

}
