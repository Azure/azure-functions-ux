import { DropDownElement } from './../shared/models/drop-down-element';
import { PortalResources } from './../shared/models/portal-resources';
import { TableItem } from './../controls/tbl/tbl.component';
import { Input } from "@angular/core";
// import { ArmObj } from './../shared/models/arm/arm-obj';
// import { FunctionApp } from './../shared/function-app';
// import { Observable } from 'rxjs/Observable';
import { Subscription as RxSubscription } from "rxjs/Subscription";
import { Subject } from "rxjs/Subject";
import { TreeViewInfo, SiteData } from "./../tree-view/models/tree-view-info";
import { AppNode } from "./../tree-view/app-node";
import { BusyStateComponent } from "./../busy-state/busy-state.component";
import { SiteTabComponent } from "./../site/site-dashboard/site-tab/site-tab.component";
import { TranslateService } from '@ngx-translate/core';
// import { BroadcastService } from './../shared/services/broadcast.service';
import { CacheService } from "./../shared/services/cache.service";
import { PortalService } from "./../shared/services/portal.service";
import { AiService } from "./../shared/services/ai.service";
import { Component, OnInit } from '@angular/core';


export interface LogicAppInfo {
  name: string;
  id: string;
  resourceGroup: string;
  location: string;
}

export interface LogicAppTableItem extends TableItem {
  title: string;
  id: string;
  resourceGroup: string;
  location: string;
}

@Component({
  selector: 'app-logic-apps',
  templateUrl: './logic-apps.component.html',
  styleUrls: ['./logic-apps.component.scss']
})
export class LogicAppsComponent implements OnInit {
  private _viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
  private _viewInfo: TreeViewInfo<SiteData>;
  private _viewInfoSub: RxSubscription;
  private _appNode: AppNode;
  private _busyState: BusyStateComponent;

  public logicApps: LogicAppInfo[] = [];
  public tableItems: TableItem[] = [];
  public subId: string;
  public logicAppsIcon = 'images/logicapp.svg';
  public initialized = false;

  public allLocations = this._translateService.instant(PortalResources.allLocations);
  public numberLocations = this._translateService.instant(PortalResources.locationCount);
  public locationOptions: DropDownElement<string>[] = [];
  public locationsDisplayText = this.allLocations;
  public selectedLocations: string[] = [];

  public allResourceGroups = this._translateService.instant(PortalResources.allResourceGroups);
  public numberResourceGroups = this._translateService.instant(PortalResources.resourceGroupCount);
  public resourceGroupOptions: DropDownElement<string>[] = [];
  public resourceGroupsDisplayText = this.allResourceGroups;
  public selectedResourceGroups: string[] = [];

  public currGroup = 'none';

  @Input()
  set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
    this._viewInfoStream.next(viewInfo);
  }

  // @ViewChild('table') logicAppTable: TblComponent;

  constructor(
    // private _armService: ArmService,
    private _aiService: AiService,
    private _portalService: PortalService,
    private _cacheService: CacheService,
    // private _broadcastService: BroadcastService,
    private _translateService: TranslateService,
    siteTabComponent: SiteTabComponent
  ) {
    this._busyState = siteTabComponent.busyState;

    this._viewInfoSub = this._viewInfoStream
      .switchMap(viewInfo => {
        this._viewInfo = viewInfo;
        this._busyState.setBusyState();
        this.initialized = false;

        this._appNode = <AppNode>viewInfo.node;
        this.subId = this._appNode.subscriptionId;

        return this._cacheService.getArm(
          `/subscriptions/${this.subId}/providers/Microsoft.Logic/workflows`,
          true,
          '2016-06-01',
          true
        );
      })
      .do(null, e => {
        this._aiService.trackException(e, 'logic-apps');
      })
      .retry()
      .subscribe(r => {
        this.logicApps = r.json().value
        .map(app => (<LogicAppInfo>{
          name: app.name,
          id: app.id,
          resourceGroup: app.id.split('/')[4],
          location:  this._translateService.instant(app.location),
          type: 'row'
        }));

        this.tableItems = this.logicApps
          .map(app => (<LogicAppTableItem>{
            title: app.name,
            id: app.id,
            resourceGroup: app.resourceGroup,
            location:  app.location,
            type: 'row'
          }));

        this.locationOptions = this.uniqueTypes(this.logicApps, 'location')
          .map(location => ({
            displayLabel: location,
            value: location
          }));
        this.resourceGroupOptions = this.uniqueTypes(this.logicApps, 'resourceGroup')
          .map(resourceGroup => ({
            displayLabel: resourceGroup,
            value: resourceGroup
          }));

        this._busyState.clearBusyState();
        this.initialized = true;
      });
  }

  ngOnInit() {}

  clickRow(item: LogicAppTableItem) {
    this._portalService.openBlade(
      {
        detailBlade: 'LogicAppsDesignerBlade',
        detailBladeInputs: {
          id: item.id
        },
        extension: 'Microsoft_Azure_EMA'
      },
      'LogicAppsComponent'
    );
  }

  uniqueTypes(apps: LogicAppInfo[], type: string) {
    const typeDict = {};
    apps.forEach(app => typeDict[app[type]] = app[type]);

    const typeArray = [];
    for (const typeItem in typeDict) {
      if (typeDict.hasOwnProperty(typeItem)) {
        typeArray.push(typeItem);
      }
    }

    return typeArray.sort();
  }

  onLocationsSelect(locations: string[]) {
    this.selectedLocations = locations;
    const newItems = this.tableItems.filter(item => item.type === 'group');
    const filteredItems = this.logicApps.filter(app => this.selectedLocations.find(l => l === app.location))
      .filter(app => this.selectedResourceGroups.find(r => r === app.resourceGroup))
      .map(app => (<LogicAppTableItem>{
        title: app.name,
        id: app.id,
        type: 'row',
        resourceGroup: app.resourceGroup,
        location: app.location,
      }));
    this.tableItems = newItems.concat(filteredItems);

    // timeout is needed to re-render to page for the grouping update with new locations
    setTimeout(() => {
      // this.logicAppTable.groupItems(this.currGroup);
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

  onResourceGroupsSelect(resourceGroups: string[]) {
    this.selectedResourceGroups = resourceGroups;
    const newItems = this.tableItems.filter(item => item.type === 'group');
    const filteredItems = this.logicApps.filter(app => this.selectedResourceGroups.find(r => r === app.resourceGroup))
      .filter(app => this.selectedLocations.find(l => l === app.location))
      .map(app => (<LogicAppTableItem>{
        title: app.name,
        id: app.id,
        type: 'row',
        resourceGroup: app.resourceGroup,
        location: app.location
      }));
    this.tableItems = newItems.concat(filteredItems);

    // timeout is needed to re-render to page for the grouping update with new resourceGroups
    setTimeout(() => {
      // this.logicAppTable.groupItems(this.currGroup);
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
}
