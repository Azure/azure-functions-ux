import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { TreeViewInfo, SiteData } from './../../tree-view/models/tree-view-info';
import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';

@Component({
  selector: 'app-app-settings-shell',
  templateUrl: './app-settings-shell.component.html',
  styleUrls: ['./app-settings-shell.component.scss'],
})
export class AppSettingsShellComponent implements OnDestroy {
  viewInfo: TreeViewInfo<SiteData>;

  private routeParamsSubscription: Subscription;
  constructor(translateService: TranslateService, route: ActivatedRoute) {
    this.routeParamsSubscription = route.params.subscribe(x => {
      this.viewInfo = {
        resourceId: ArmSiteDescriptor.generateResourceUri(x['subscriptionId'], x['resourceGroup'], x['site'], x['slot']),
        dashboardType: DashboardType.none,
        node: null,
        data: null,
      };
    });
  }

  ngOnDestroy(): void {
    this.routeParamsSubscription.unsubscribe();
  }
}
