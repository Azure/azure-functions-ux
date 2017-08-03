import { TblComponent, TableItem } from './../controls/tbl/tbl.component';
import { TranslateService } from '@ngx-translate/core';
import { DropDownElement } from './../shared/models/drop-down-element';
import { PortalResources } from './../shared/models/portal-resources';
import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { AppsNode } from './../tree-view/apps-node';
import { AppNode } from './../tree-view/app-node';
import { TreeViewInfo } from './../tree-view/models/tree-view-info';

interface AppTableItem extends TableItem {
  title: string;
  subscription: string;
  resourceGroup: string;
  location: string;
  appNode?: AppNode;
}

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

  public allLocations = this.translateService.instant(PortalResources.allLocations);
  public numberLocations = this.translateService.instant(PortalResources.locationCount);
  public locationOptions: DropDownElement<string>[] = [];
  public locationsDisplayText = this.allLocations;
  public selectedLocations: string[] = [];

  @ViewChild('table') appTable: TblComponent;

  public groupOptions: DropDownElement<string>[] = [{ displayLabel: this.translateService.instant(PortalResources.grouping_none), value: 'none' },
  { displayLabel: this.translateService.instant(PortalResources.grouping_resourceGroup), value: 'resourceGroup' },
  { displayLabel: this.translateService.instant(PortalResources.grouping_subscription), value: 'subscription' },
  { displayLabel: this.translateService.instant(PortalResources.grouping_location), value: 'location' }];
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
        this.tableItems = this.apps.map(app => (<AppTableItem>{
          title: app.title,
          subscription: app.subscription,
          type: 'row',
          resourceGroup: app.resourceGroup,
          location: app.location,
          appNode: app
        }));

        this.locationOptions = this.uniqueLocations(this.apps)
          .map(location => ({
            displayLabel: this.translateService.instant(location),
            value: this.translateService.instant(location)
          }));
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

  clickRow(item: AppTableItem) {
    item.appNode.sideNav.searchExact(item.title);
  }

  uniqueLocations(apps: AppNode[]) {
    const locations = [];
    for (const app of apps) {
      if (!locations.find(l => l === this.translateService.instant(app.location))) {
        locations.push(this.translateService.instant(app.location));
      }
    }
    return locations.sort();
  }

  onLocationsSelect(locations: string[]) {
    this.selectedLocations = locations;
    const newItems = this.tableItems.filter(item => item.type === 'group');
    this.tableItems = newItems.concat(this.apps.filter(app => this.selectedLocations.find(l => l === this.translateService.instant(app.location)))
      .map(app => (<AppTableItem>{
        title: app.title,
        subscription: app.subscription,
        type: 'row',
        resourceGroup: app.resourceGroup,
        location: this.translateService.instant(app.location),
        appNode: app
      })));

    // timeout is needed to re-render to page for the grouping update with new locations
    setTimeout(() => {
      this.appTable.groupItems(this.currGroup);
    }, 0);

    if (this.selectedLocations.length === this.locationOptions.length) { // if all locations are selected display all locations
      this._updateLocDisplayText(this.allLocations);
    } else if (this.selectedLocations.length > 1) { // else if more than 1 locations are selected display the number of locations
      this._updateLocDisplayText(this.translateService.instant(PortalResources.locationCount).format(locations.length));
    } else { // else 1 location is selected and its name is displayed
      this._updateLocDisplayText(`${this.selectedLocations[0]}`);
    }
  }

  private _updateLocDisplayText(displayText: string) {
    this.locationsDisplayText = displayText;

    // timeout is needed to re-render the page for display update
    setTimeout(() => {
      this.locationsDisplayText = displayText;
    }, 0);
  }

  onGroupSelect(group: string) {
    this._setGroup(group);
  }

  private _setGroup(group: string) {
    this.currGroup = group;

    // timeout is needed to re-render the page for grouping update
    setTimeout(() => {
      this.appTable.groupItems(group);
    }, 0);
  }

}
