import { ResourceGroup } from './../shared/models/resource-group';
import { element } from 'protractor';
import { TblComponent, TableItem } from './../controls/tbl/tbl.component';
import { TblThComponent } from './../controls/tbl/tbl-th/tbl-th.component';
import { TranslateService } from '@ngx-translate/core';
import { DropDownElement } from './../shared/models/drop-down-element';
import { DropDownComponent } from './../drop-down/drop-down.component';
import { PortalResources } from './../shared/models/portal-resources';
import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
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
  public tableItems: TableItem[] = [];
  public appsNode: AppsNode;
  public Resources = PortalResources;

  public isLoading = true;

  public locationOptions: DropDownElement<string>[] = [];
  public locationsDisplayText = '';
  public selectedLocations: string[] = [];

  @ViewChild('table') appTable: TblComponent;
  @ViewChild('nameHeader') nameHeader: TblThComponent;
  @ViewChild('subHeader') subHeader: TblThComponent;
  @ViewChild('resHeader') resHeader: TblThComponent;
  @ViewChild('locHeader') locHeader: TblThComponent;

  public groupOptions: DropDownElement<string>[] = [{displayLabel: this.translateService.instant(PortalResources.grouping_none), value: 'none'},
                                                    {displayLabel: this.translateService.instant(PortalResources.grouping_resourceGroup), value: 'resourceGroup'},
                                                    {displayLabel: this.translateService.instant(PortalResources.grouping_subscription), value: 'subscription'},
                                                    {displayLabel: this.translateService.instant(PortalResources.grouping_location), value: 'location'}];
  public groupDisplayText = '';
  public currGroup = 'none';

  private _viewInfoSubscription: RxSubscription;

  constructor(public translateService: TranslateService) {
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
          this.tableItems.push ({
            title: app.title,
            subscription: app.subscription,
            type: 'row',
            resourceGroup: app.resourceGroup,
            location: app.location,
            appNode: app
          })
        );
        this.uniqueLocations(this.apps).forEach(location =>
          this.locationOptions.push ({
            displayLabel: location,
            value: location
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

  clickRow(item: TableItem) {
    item.appNode.sideNav.searchExact(item.title);
  }

  contains(array: any[], element: any) {
    for (const elem of array) {
      if (elem === element) {
        return true;
      }
    }
    return false;
  }

  uniqueLocations(apps: AppNode[]) {
    const locations = [];
    for (const app of apps) {
      if (!this.contains(locations, app.location)) {
        locations.push(app.location);
      }
    }
    return locations.sort();
  }

  onLocationsSelect(locations: string[]) {
    this.selectedLocations = locations;
    const newItems = [];
    this.tableItems.forEach(item => {
      if (item.type === 'group') {
        newItems.push(item);
      }
    });
    for (const app of this.apps) {
      if (this.contains(this.selectedLocations, app.location)) {
        newItems.push({
            title: app.title,
            subscription: app.subscription,
            type: 'row',
            resourceGroup: app.resourceGroup,
            location: app.location,
            appNode: app
        });
      }

    };

    this.tableItems = newItems;
    setTimeout(() => {
        this.appTable.groupItems(this.currGroup);
    }, 0);

    if (this.selectedLocations.length === this.locationOptions.length) {
        this._updateLocDisplayText(this.translateService.instant(PortalResources.allLocations));
    } else if (this.selectedLocations.length > 1) {
        this._updateLocDisplayText(this.translateService.instant(PortalResources.locationCount).format(locations.length));
    } else {
        this._updateLocDisplayText(`${locations[0]}`);
    }
  }

  private _updateLocDisplayText(displayText: string) {
    this.locationsDisplayText = '';
    setTimeout(() => {
        this.locationsDisplayText = displayText;
    }, 10);
  }

  onGroupSelect(group: string) {
      this._setGroup(group);
  }

  private _setGroup(group: string) {
    this.currGroup = group;

    setTimeout(() => {
        this.appTable.groupItems(group);
    }, 0);
  }

}
