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
import { FunctionApp } from '../shared/function-app';
import { GlobalStateService} from '../shared/services/global-state.service';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../shared/models/portal-resources';
import { PortalService } from '../shared/services/portal.service';
import { FunctionManageNode } from '../tree-view/function-node';
import { DashboardType } from '../tree-view/models/dashboard-type';

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
  public isLoading: boolean;
  public functionApp: FunctionApp;

  private _viewInfoSubscription : RxSubscription;

  private _functionsNode : FunctionsNode;

  constructor(private _globalStateService: GlobalStateService,
      private _portalService: PortalService,
      private _translateService: TranslateService
  ) {
      this.viewInfoStream = new Subject<TreeViewInfo>();

      this._viewInfoSubscription = this.viewInfoStream
      .distinctUntilChanged()
      .switchMap(viewInfo =>{
        this.isLoading = true;
        this._functionsNode = (<FunctionsNode>viewInfo.node);
        this.functionApp = this._functionsNode.functionApp;
        return this._functionsNode.loadChildren();
      })
      .subscribe(() =>{
        this.isLoading = false;
        this.functions = (<FunctionNode[]>this._functionsNode.children)
        .map(c =>{
            return this.createFunctionItem(c);
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

  clickRow(item: FunctionItem){
      item.node.select();
  }

  enableChange(item: FunctionItem) {
      item.disabled = !item.disabled;
      item.node.functionInfo.config.disabled = !item.node.functionInfo.config.disabled;
      this._globalStateService.setBusyState();
      return this.functionApp.updateFunction(item.node.functionInfo).subscribe(r => {
          this._globalStateService.clearBusyState();
      });
  }

  clickDelete(item: FunctionItem) {
      var functionInfo = item.node.functionInfo;
      var result = confirm(this._translateService.instant(PortalResources.functionManage_areYouSure, { name: functionInfo.name }));
      if (result) {
          this._globalStateService.setBusyState();
          this._portalService.logAction("edit-component", "delete");
          this.functionApp.deleteFunction(functionInfo)
              .subscribe(r => {
                  var indexToDelete = this.functions.indexOf(item);
                  if (indexToDelete > -1) {
                      this.functions.splice(indexToDelete, 1);
                  }

                  this._functionsNode.removeChild(item.node.functionInfo, false);

                  let defaultHostName = this._functionsNode.functionApp.site.properties.defaultHostName;
                  let scmHostName = this._functionsNode.functionApp.site.properties.hostNameSslStates.find(s => s.hostType === 1).name;

                  item.node.sideNav.cacheService.clearCachePrefix(`https://${defaultHostName}`);
                  item.node.sideNav.cacheService.clearCachePrefix(`https://${scmHostName}`);

                  this._globalStateService.clearBusyState();
              });
          }
      }

    searchChanged(event: any) {
          this.functions = (<FunctionNode[]>this._functionsNode.children).filter(c => {
              return c.functionInfo.name.toLowerCase().indexOf(event.target.value.toLowerCase()) > -1;
          }).map(c => {
              return this.createFunctionItem(c);
          });
    }

    searchCleared() {
        this.functions = (<FunctionNode[]>this._functionsNode.children)
            .map((c) => {
                return this.createFunctionItem(c);
            });
    }

    onNewFunctionClick() {
        this._functionsNode.openCreateDashboard(DashboardType.createFunction);
    }

    private createFunctionItem(c: FunctionNode) : FunctionItem {
        return <FunctionItem>{
            name: c.title,
            disabled: c.functionInfo.config.disabled,
            node: c
        }
    }
}
