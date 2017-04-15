import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { FunctionNode } from './../tree-view/function-node';
import { FunctionInfo } from './../shared/models/function-info';
import { FunctionsNode } from './../tree-view/functions-node';
import { TreeViewInfo } from './../tree-view/models/tree-view-info';

interface FunctionItem{
  name : string,
  disabled : boolean,
  node : FunctionNode
}

@Component({
  selector: 'functions-list',
  templateUrl: './functions-list.component.html',
  styleUrls: ['./functions-list.component.scss'],
  inputs: ['viewInfoInput']
})
export class FunctionsListComponent implements OnInit, OnDestroy {
  public viewInfoStream : Subject<TreeViewInfo>;
  public functions : FunctionItem[] = [];
  public isLoading : boolean;

  private _viewInfoSubscription : RxSubscription;

  private _functionsNode : FunctionsNode;

  constructor() {
      this.viewInfoStream = new Subject<TreeViewInfo>();

      this._viewInfoSubscription = this.viewInfoStream
      .distinctUntilChanged()
      .switchMap(viewInfo =>{
        this.isLoading = true;
        this._functionsNode = (<FunctionsNode>viewInfo.node);
        return this._functionsNode.loadChildren();
      })
      .subscribe(() =>{
        this.isLoading = false;
        this.functions = (<FunctionNode[]>this._functionsNode.children)
        .map(c =>{
          return <FunctionItem>{
            name : c.title,
            disabled : c.functionInfo.config.disabled,
            node : c
          }
        });
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

  clickRow(item : FunctionItem){
    item.node.select();
  }
}
