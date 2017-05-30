import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { AppsNode } from './../tree-view/apps-node';
import { AppNode } from './../tree-view/app-node';
import { TreeViewInfo } from './../tree-view/models/tree-view-info';

@Component({
  selector: 'apps-list',
  templateUrl: './apps-list.component.html',
  styleUrls: ['./apps-list.component.scss'],
  inputs: ['viewInfoInput']
})
export class AppsListComponent implements OnInit, OnDestroy {
  public viewInfoStream : Subject<TreeViewInfo>;
  public apps : AppNode[] = [];
  public appsNode : AppsNode;

  private _viewInfoSubscription : RxSubscription;
  private _origRefToItems : AppNode[];

  constructor() {
      this.viewInfoStream = new Subject<TreeViewInfo>();

      this._viewInfoSubscription = this.viewInfoStream
      .distinctUntilChanged()
      .switchMap(viewInfo =>{
        this.appsNode = (<AppsNode>viewInfo.node);
        /* this is need to avoid flickering b/w no list view & table on load
        see https://github.com/Azure/azure-functions-ux/issues/1286 */
        this.appsNode.isLoading = true;
        return (<AppsNode>viewInfo.node).childrenStream;
      })
      .subscribe(children =>{
        this.apps = children;

        /* fix for https://github.com/Azure/azure-functions-ux/issues/1374 
         if the FunctionApps node has a sibling, the below logic will need to be updated */
        if(children.length > 0){
          this.appsNode.isLoading = false;
        }
        this._origRefToItems = children;
      });

   }

  ngOnInit() {
  }

  ngOnDestroy(): void{
    this._viewInfoSubscription.unsubscribe();
  }

  set viewInfoInput(viewInfo : TreeViewInfo){
      this.viewInfoStream.next(viewInfo);
  }

  clickRow(item : AppNode){
    item.sideNav.searchExact(item.title);
  }
}
