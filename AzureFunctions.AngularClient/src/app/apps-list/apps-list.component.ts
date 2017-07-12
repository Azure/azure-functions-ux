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

  public isLoading = true;

  private _viewInfoSubscription : RxSubscription;

  constructor() {
      this.viewInfoStream = new Subject<TreeViewInfo>();

      this._viewInfoSubscription = this.viewInfoStream
      .distinctUntilChanged()
      .switchMap(viewInfo =>{
        this.appsNode = (<AppsNode>viewInfo.node);
        this.isLoading = true;
        return (<AppsNode>viewInfo.node).childrenStream;
      })
      .subscribe(children =>{
        this.apps = children;
        this.isLoading = false;
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
