import { ActivatedRoute } from '@angular/router';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { TblComponent, TableItem } from './../controls/tbl/tbl.component';
import { TranslateService } from '@ngx-translate/core';
import { DropDownElement } from './../shared/models/drop-down-element';
import { PortalResources } from './../shared/models/portal-resources';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { AppNode } from './../tree-view/app-node';

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
export class AppsListComponent implements OnDestroy {
  public apps: AppNode[] = [];
  public tableItems: TableItem[] = [];
  public Resources = PortalResources;
  public isLoading = true;

  public allLocations = this.translateService.instant(PortalResources.allLocations);
  public numberLocations = this.translateService.instant(PortalResources.locationCount);
  public locationOptions: DropDownElement<string>[] = [];
  public locationsDisplayText = this.allLocations;
  public selectedLocations: string[] = [];

  public allResourceGroups = this.translateService.instant(PortalResources.allResourceGroups);
  public numberResourceGroups = this.translateService.instant(PortalResources.resourceGroupCount);
  public resourceGroupOptions: DropDownElement<string>[] = [];
  public resourceGroupsDisplayText = this.allResourceGroups;
  public selectedResourceGroups: string[] = [];

  @ViewChild('table') appTable: TblComponent;

  public groupOptions: DropDownElement<string>[] = [
    { displayLabel: this.translateService.instant(PortalResources.grouping_none), value: 'none' },
    { displayLabel: this.translateService.instant(PortalResources.grouping_resourceGroup), value: 'resourceGroup' },
    { displayLabel: this.translateService.instant(PortalResources.grouping_subscription), value: 'subscription' },
    { displayLabel: this.translateService.instant(PortalResources.grouping_location), value: 'location' }];

  public groupDisplayText = '';
  public currGroup = 'none';

  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    public translateService: TranslateService,
    public broadcastService: BroadcastService,
    public route: ActivatedRoute) {

    this.broadcastService.getEvents<AppNode[]>(BroadcastEvent.UpdateAppsList)
      .takeUntil(this._ngUnsubscribe)
      .distinctUntilChanged()
      .subscribe(children => {
        this.isLoading = !children;
        this.apps = children ? children : [];

        this.tableItems = this.apps.map(app => (<AppTableItem>{
          title: app.title,
          subscription: app.subscription,
          type: 'row',
          resourceGroup: app.resourceGroup,
          location: this.translateService.instant(app.location),
          appNode: app
        }));

        this.locationOptions = this.uniqueLocations(this.apps)
          .map(location => ({
            displayLabel: this.translateService.instant(location),
            value: this.translateService.instant(location)
          }));
        this.resourceGroupOptions = this.uniqueResourceGroups(this.apps)
          .map(resourceGroup => ({
            displayLabel: resourceGroup,
            value: resourceGroup
          }));
      });
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe.next();
  }

  clickRow(item: AppTableItem) {
    item.appNode.sideNav.searchExact(item.title);
  }

  uniqueLocations(apps: AppNode[]) {
    const locationsDict = {};
    apps.forEach(app => locationsDict[this.translateService.instant(app.location)] = this.translateService.instant(app.location));

    const locations = [];
    for (const location in locationsDict) {
      if (locationsDict.hasOwnProperty(location)) {
        locations.push(location);
      }
    }

    return locations.sort();
  }

  onLocationsSelect(locations: string[]) {
    this.selectedLocations = locations;
    if (!this.apps) {
      return;
    }

    const newItems = this.tableItems.filter(item => item.type === 'group');
    const filteredItems = this.apps.filter(app => this.selectedLocations.find(l => l === this.translateService.instant(app.location)))
      .filter(app => this.selectedResourceGroups.find(r => r === app.resourceGroup))
      .map(app => (<AppTableItem>{
        title: app.title,
        subscription: app.subscription,
        type: 'row',
        resourceGroup: app.resourceGroup,
        location: this.translateService.instant(app.location),
        appNode: app
      }));
    this.tableItems = newItems.concat(filteredItems);

    // timeout is needed to re-render to page for the grouping update with new locations
    setTimeout(() => {
      this.appTable.groupItems(this.currGroup);
    }, 0);

    if (this.selectedLocations.length === this.locationOptions.length) { // if all locations are selected display all locations
      this._updateLocDisplayText(this.allLocations);
    } else if (this.selectedLocations.length > 1) { // else if more than 1 locations are selected display the number of locations
      this._updateLocDisplayText(this.numberLocations.format(locations.length));
    } else { // else 1 location is selected and its name is displayed
      this._updateLocDisplayText(`${this.selectedLocations[0]}`);
    }
  }

  private _updateLocDisplayText(displayText: string) {
    // timeout is needed to re-render the page for display update
    setTimeout(() => {
      this.locationsDisplayText = displayText;
    }, 0);
  }

  uniqueResourceGroups(apps: AppNode[]) {
    const resourceGroupsDict = {};
    apps.forEach(app => resourceGroupsDict[app.resourceGroup] = app.resourceGroup);

    const resourceGroups = [];
    for (const resourceGroup in resourceGroupsDict) {
      if (resourceGroupsDict.hasOwnProperty(resourceGroup)) {
        resourceGroups.push(resourceGroup);
      }
    }

    return resourceGroups.sort();
  }

  onResourceGroupsSelect(resourceGroups: string[]) {
    this.selectedResourceGroups = resourceGroups;
    const newItems = this.tableItems.filter(item => item.type === 'group');
    const filteredItems = this.apps.filter(app => this.selectedResourceGroups.find(r => r === app.resourceGroup))
      .filter(app => this.selectedLocations.find(l => l === this.translateService.instant(app.location)))
      .map(app => (<AppTableItem>{
        title: app.title,
        subscription: app.subscription,
        type: 'row',
        resourceGroup: app.resourceGroup,
        location: this.translateService.instant(app.location),
        appNode: app
      }));
    this.tableItems = newItems.concat(filteredItems);

    // timeout is needed to re-render to page for the grouping update with new resourceGroups
    setTimeout(() => {
      this.appTable.groupItems(this.currGroup);
    }, 0);

    if (this.selectedResourceGroups.length === this.resourceGroupOptions.length) { // if all locations are selected display all locations
      this._updateResGroupDisplayText(this.allResourceGroups);
    } else if (this.selectedResourceGroups.length > 1) { // else if more than 1 locations are selected display the number of locations
      this._updateResGroupDisplayText(this.numberResourceGroups.format(resourceGroups.length));
    } else { // else 1 location is selected and its name is displayed
      this._updateResGroupDisplayText(`${this.selectedResourceGroups[0]}`);
    }
  }

  private _updateResGroupDisplayText(displayText: string) {
    // timeout is needed to re-render the page for display update
    setTimeout(() => {
      this.resourceGroupsDisplayText = displayText;
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
