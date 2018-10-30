import { Component, OnDestroy } from '@angular/core';
import { TreeViewInfo, SiteData } from 'app/tree-view/models/tree-view-info';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute } from '@angular/router';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';

@Component({
  selector: 'app-deployment-shell',
  templateUrl: './deployment-shell.component.html',
  styleUrls: ['./deployment-shell.component.scss'],
})
export class DeploymentShellComponent implements OnDestroy {
  viewInfo: TreeViewInfo<SiteData>;

  private routeParamsSubscription: Subscription;

  constructor(route: ActivatedRoute) {
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
