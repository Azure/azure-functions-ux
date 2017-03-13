import { ProxiesNode } from './../tree-view/proxies-node';
import { Subject, Subscription as RxSubscription } from 'rxjs/Rx';
import { TreeViewInfo } from './../tree-view/models/tree-view-info';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'proxies-list',
  templateUrl: './proxies-list.component.html',
  styleUrls: ['./proxies-list.component.scss'],
  inputs: ['viewInfoInput']
})
export class ProxiesListComponent implements OnInit {
  public viewInfoStream : Subject<TreeViewInfo>;
  public items : ProxiesNode[] = [];
  public isLoading : boolean;

  private _viewInfoSubscription : RxSubscription;

  private _proxiesNode : ProxiesNode;

  constructor() {
      this.viewInfoStream = new Subject<TreeViewInfo>();

      this._viewInfoSubscription = this.viewInfoStream
      .distinctUntilChanged()
      .switchMap(viewInfo =>{
        this.isLoading = true;
        this._proxiesNode = (<ProxiesNode>viewInfo.node);
        return this._proxiesNode.loadChildren();
      })
      .subscribe(() =>{
        this.isLoading = false;
        this.items = <ProxiesNode[]>this._proxiesNode.children;
      })
  }

  ngOnInit() {
  }

  ngOnDestroy(): void{
    this._viewInfoSubscription.unsubscribe();
  }

  set viewInfoInput(viewInfo : TreeViewInfo){
    this.viewInfoStream.next(viewInfo);
  }

  clickRow(item : ProxiesNode){
    item.select();
  }

}
