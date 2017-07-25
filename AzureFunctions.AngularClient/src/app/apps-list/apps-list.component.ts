import { DropDownElement } from './../shared/models/drop-down-element';
import { DropDownComponent } from './../drop-down/drop-down.component';
import { PortalResources } from './../shared/models/portal-resources';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
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
})
export class AppsListComponent implements OnInit, OnDestroy {
  public viewInfoStream: Subject<TreeViewInfo<any>>;
  public apps: AppNode[] = [];
  public appsNode: AppsNode;
  public Resources = PortalResources;

  public isLoading = true;

  public locationOptions: DropDownElement<string>[] = [];

  private _viewInfoSubscription: RxSubscription;

  constructor() {
    this.viewInfoStream = new Subject<TreeViewInfo<any>>();

    this._viewInfoSubscription = this.viewInfoStream
      .distinctUntilChanged()
      .switchMap(viewInfo => {
        this.appsNode = (<AppsNode>viewInfo.node);
        this.isLoading = true;
        return (<AppsNode>viewInfo.node).childrenStream;
      })
      .subscribe(children => {
        this.apps = children;
        this.apps.forEach(app =>
          this.locationOptions.push ({
            displayLabel: app.location,
            value: app.location
          })
        );
        this.isLoading = false;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this._viewInfoSubscription.unsubscribe();
  }

  @Input() set viewInfoInput(viewInfo: TreeViewInfo<any>) {
    this.viewInfoStream.next(viewInfo);
  }

  clickRow(item: AppNode) {
    item.sideNav.searchExact(item.title);
  }
}
