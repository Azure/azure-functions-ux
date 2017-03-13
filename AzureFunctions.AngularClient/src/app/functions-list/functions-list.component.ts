import { FunctionNode } from './../tree-view/function-node';
import { FunctionInfo } from './../shared/models/function-info';
import { FunctionsNode } from './../tree-view/functions-node';
// import { AppNode } from './../tree-view/app-node';
import { Subject, Subscription as RxSubscription } from 'rxjs/Rx';
import { TreeViewInfo } from './../tree-view/models/tree-view-info';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'functions-list',
  templateUrl: './functions-list.component.html',
  styleUrls: ['./functions-list.component.scss'],
  inputs: ['viewInfoInput']
})
export class FunctionsListComponent implements OnInit, OnDestroy {
  public viewInfoStream : Subject<TreeViewInfo>;
  public items : FunctionNode[] = [];
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
        this.items = <FunctionNode[]>this._functionsNode.children;
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

  clickRow(item : FunctionNode){
    item.select();
  }
}
