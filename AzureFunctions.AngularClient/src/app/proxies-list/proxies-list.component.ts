import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { ProxyNode } from './../tree-view/proxy-node';
import { ProxiesNode } from './../tree-view/proxies-node';
import { TreeViewInfo } from './../tree-view/models/tree-view-info';

interface ProxyItem {
  name: string,
  url: string,
  node: ProxyNode
}

@Component({
  selector: 'proxies-list',
  templateUrl: './proxies-list.component.html',
  styleUrls: ['./proxies-list.component.scss'],
  inputs: ['viewInfoInput']
})
export class ProxiesListComponent implements OnInit {
  public viewInfoStream: Subject<TreeViewInfo<any>>;
  public proxies: ProxyItem[] = [];
  public isLoading: boolean;

  private _viewInfoSubscription: RxSubscription;

  private _proxiesNode: ProxiesNode;

  constructor() {
    this.viewInfoStream = new Subject<TreeViewInfo<any>>();

    this._viewInfoSubscription = this.viewInfoStream
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
            }
          });
      })
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this._viewInfoSubscription.unsubscribe();
  }

  set viewInfoInput(viewInfo: TreeViewInfo<any>) {
    this.viewInfoStream.next(viewInfo);
  }

  clickRow(item: ProxyItem) {
    item.node.select();
  }

}
