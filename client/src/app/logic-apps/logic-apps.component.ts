import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { LogCategories, SiteTabIds } from './../shared/models/constants';
import { LogService } from './../shared/services/log.service';
import { ArmService } from 'app/shared/services/arm.service';
import { BusyStateScopeManager } from './../busy-state/busy-state-scope-manager';
import { BroadcastService } from './../shared/services/broadcast.service';
import { DropDownElement } from './../shared/models/drop-down-element';
import { PortalResources } from './../shared/models/portal-resources';
import { TableItem, TblComponent } from './../controls/tbl/tbl.component';
import { ViewChild } from '@angular/core';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from './../shared/services/cache.service';
import { PortalService } from './../shared/services/portal.service';
import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FunctionService } from 'app/shared/services/function.service';

interface LogicAppInfo {
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
  styleUrls: ['./logic-apps.component.scss'],
})
export class LogicAppsComponent extends FunctionAppContextComponent {
  private _resourceId: string;

  public logicApps: LogicAppInfo[] = [];
  public tableItems: TableItem[] = [];
  public subId: string;
  public logicAppsIcon = 'image/logicapp.svg';
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

  private _busyManager: BusyStateScopeManager;

  @ViewChild('table')
  logicAppTable: TblComponent;

  public groupOptions: DropDownElement<string>[] = [
    { displayLabel: this._translateService.instant(PortalResources.grouping_none), value: 'none' },
    { displayLabel: this._translateService.instant(PortalResources.grouping_resourceGroup), value: 'resourceGroup' },
    { displayLabel: this._translateService.instant(PortalResources.grouping_location), value: 'location' },
  ];
  public groupDisplayText = '';
  public currGroup = 'none';

  constructor(
    private _armService: ArmService,
    private _portalService: PortalService,
    private _cacheService: CacheService,
    private _translateService: TranslateService,
    private _logService: LogService,
    _functionAppService: FunctionAppService,
    broadcastService: BroadcastService,
    functionService: FunctionService
  ) {
    super('logic-apps', _functionAppService, broadcastService, functionService);

    this._busyManager = new BusyStateScopeManager(broadcastService, SiteTabIds.logicApps);
  }

  setup(): RxSubscription {
    return this.viewInfoEvents
      .switchMap(viewInfo => {
        this._busyManager.setBusy();
        this.initialized = false;

        this._resourceId = viewInfo.resourceId;
        this.subId = new ArmSiteDescriptor(this._resourceId).getWebsiteId().SubscriptionId;
        // Have to remove leading '/' for filter to function and ending '/' for unique function apps
        const logicAppResId = this._resourceId.substr(1) + '/';

        return Observable.zip(
          this._cacheService.getArm(
            `/subscriptions/${this.subId}/providers/Microsoft.Logic/workflows?api-version=${
              this._armService.logicAppsApiVersion
            }&$filter=contains(referencedResourceId, '${logicAppResId}')`,
            true,
            this._armService.logicAppsApiVersion,
            true
          ),
          this._cacheService.getArm(
            `/subscriptions/${this.subId}/providers/Microsoft.Logic/workflows`,
            true,
            this._armService.logicAppsApiVersion,
            true
          ),
          (a, s) => ({ app: a.json(), sub: s.json() })
        );
      })
      .do(null, e => {
        this._logService.error(LogCategories.generalSettings, '/logic-apps', e);
      })
      .retry()
      .subscribe(r => {
        const selectedJson = r.app.value.length > 0 ? r.app : r.sub;
        this.logicApps = selectedJson.value
          .map(
            app =>
              <LogicAppInfo>{
                name: app.name,
                id: app.id,
                resourceGroup: app.id.split('/')[4],
                location: this._translateService.instant(app.location),
                type: 'row',
              }
          )
          .sort((a: LogicAppInfo, b: LogicAppInfo) => {
            return a.name.localeCompare(b.name);
          });

        this.tableItems = this.logicApps.map(
          app =>
            <LogicAppTableItem>{
              title: app.name,
              id: app.id,
              resourceGroup: app.resourceGroup,
              location: app.location,
              type: 'row',
            }
        );

        this.locationOptions = this.uniqueTypes(this.logicApps, 'location').map(location => ({
          displayLabel: location,
          value: location,
        }));

        this.resourceGroupOptions = this.uniqueTypes(this.logicApps, 'resourceGroup').map(resourceGroup => ({
          displayLabel: resourceGroup,
          value: resourceGroup,
        }));

        this._busyManager.clearBusy();
        this.initialized = true;
      });
  }

  clickRow(item: LogicAppTableItem) {
    this._portalService.openBladeDeprecated(
      {
        detailBlade: 'LogicAppsDesignerBlade',
        detailBladeInputs: {
          id: item.id,
        },
        extension: 'Microsoft_Azure_EMA',
      },
      'LogicAppsComponent'
    );
  }

  uniqueTypes(apps: LogicAppInfo[], type: string) {
    const typeDict = {};
    apps.forEach(app => (typeDict[app[type]] = app[type]));

    const typeArray = [];
    for (const typeItem in typeDict) {
      if (typeDict.hasOwnProperty(typeItem)) {
        typeArray.push(typeItem);
      }
    }

    return typeArray.sort();
  }

  // Todo: [agruning] Encapsulate locations/resources drop-down logic - https://github.com/Azure/azure-functions-ux/issues/1897
  onLocationsSelect(locations: string[]) {
    this.selectedLocations = locations;
    const newItems = this.tableItems.filter(item => item.type === 'group');
    const filteredItems = this.logicApps
      .filter(app => this.selectedLocations.find(l => l === app.location))
      .filter(app => this.selectedResourceGroups.find(r => r === app.resourceGroup))
      .map(
        app =>
          <LogicAppTableItem>{
            title: app.name,
            id: app.id,
            type: 'row',
            resourceGroup: app.resourceGroup,
            location: app.location,
          }
      );
    this.tableItems = newItems.concat(filteredItems);

    // timeout is needed to re-render to page for the grouping update with new locations
    setTimeout(() => {
      this.logicAppTable.groupItems(this.currGroup);
    }, 0);

    if (this.selectedLocations.length === this.locationOptions.length) {
      this._updateLocDisplayText(this.allLocations);
    } else if (this.selectedLocations.length > 1) {
      this._updateLocDisplayText(this.numberLocations.format(locations.length));
    } else {
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
    const filteredItems = this.logicApps
      .filter(app => this.selectedResourceGroups.find(r => r === app.resourceGroup))
      .filter(app => this.selectedLocations.find(l => l === app.location))
      .map(
        app =>
          <LogicAppTableItem>{
            title: app.name,
            id: app.id,
            type: 'row',
            resourceGroup: app.resourceGroup,
            location: app.location,
          }
      );
    this.tableItems = newItems.concat(filteredItems);

    // timeout is needed to re-render to page for the grouping update with new resourceGroups
    setTimeout(() => {
      this.logicAppTable.groupItems(this.currGroup);
    }, 0);

    if (this.selectedResourceGroups.length === this.resourceGroupOptions.length) {
      this._updateResGroupDisplayText(this.allResourceGroups);
    } else if (this.selectedResourceGroups.length > 1) {
      this._updateResGroupDisplayText(this.numberResourceGroups.format(resourceGroups.length));
    } else {
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
    this.currGroup = group;

    // timeout is needed to re-render the page for grouping update
    setTimeout(() => {
      this.logicAppTable.groupItems(group);
    }, 0);
  }
}
