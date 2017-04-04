import { AppsNode } from './../tree-view/apps-node';
import { AppNode } from './../tree-view/app-node';
import { TreeViewInfo } from './../tree-view/models/tree-view-info';
import { Subject, Observable, Subscription as RxSubscription } from 'rxjs/Rx';
import { Component, OnInit, OnDestroy } from '@angular/core';

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

  public sortedColumn : string;
  public sortAscending : boolean;

  private _viewInfoSubscription : RxSubscription;
  private _origRefToItems : AppNode[];

  constructor() {
      this.viewInfoStream = new Subject<TreeViewInfo>();

      this._viewInfoSubscription = this.viewInfoStream
      .distinctUntilChanged()
      .switchMap(viewInfo =>{
        this.appsNode = (<AppsNode>viewInfo.node);
        return (<AppsNode>viewInfo.node).childrenStream;
      })
      .subscribe(children =>{
        this.sortedColumn = "";
        this.sortAscending = true;

        this.apps = children;
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
