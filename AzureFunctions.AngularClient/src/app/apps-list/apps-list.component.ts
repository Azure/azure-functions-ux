import { TranslateService } from '@ngx-translate/core';
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
  public currApps: AppNode[] = [];
  public appsNode: AppsNode;
  public Resources = PortalResources;

  public isLoading = true;

  public locationOptions: DropDownElement<string>[] = [];
  public locationsDisplayText = "";
  public selectedLocations: string[] = [];

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
        this.currApps = this.apps;
        this.uniqueLocations(this.currApps).forEach(location =>
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

  clickRow(item: AppNode) {
    item.sideNav.searchExact(item.title);
  }

  contains(array: any[], element: any) {
    for (let elem of array) {
      if (elem === element){
        return true;
      }
    }
    return false;
  }

  uniqueLocations(apps: AppNode[]) {
    let locations = []
    for(let app of apps) {
      if (!this.contains(locations, app.location)) {
        locations.push(app.location);
      }
    }
    return locations.sort();
  }

  onLocationsSelect(locations: string[]) {
    this.selectedLocations = locations;
    this.currApps = [];
    for (let app of this.apps) {
      if (this.contains(this.selectedLocations, app.location)) {
        this.currApps.push(app);
      }

    };

    if (this.selectedLocations.length === this.locationOptions.length) {
        this._updateLocDisplayText(this.translateService.instant(PortalResources.allLocations));
    } else if (this.selectedLocations.length > 1) {
        this._updateLocDisplayText(this.translateService.instant(PortalResources.locationCount).format(locations.length));
    } else {
        this._updateLocDisplayText(`${locations[0]}`);
    }
  }

  private _updateLocDisplayText(displayText: string) {
    this.locationsDisplayText = "";
    setTimeout(() => {
        this.locationsDisplayText = displayText;
    }, 10);
    }

}
