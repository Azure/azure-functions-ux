import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { ArmFunctionDescriptor, ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { TreeViewInfo } from 'app/tree-view/models/tree-view-info';
import { DashboardType } from 'app/tree-view/models/dashboard-type';

@Component({
  selector: 'create-new-proxy-shell',
  templateUrl: './create-new-proxy-shell.component.html',
})
export class CreateNewProxyShellComponent implements OnDestroy {
  resourceId: string;
  ngUnsubscribe: Subject<void>;

  constructor(broadcastService: BroadcastService, route: ActivatedRoute) {
    this.ngUnsubscribe = new Subject<void>();

    route.params.takeUntil(this.ngUnsubscribe).subscribe(param => {
      this.resourceId = `${ArmFunctionDescriptor.generateResourceUri(
        param['subscriptionId'],
        param['resourceGroup'],
        param['site'],
        param['slot']
      )}/proxies/new/proxy`;

      const viewInfo = <TreeViewInfo<any>>{
        resourceId: this.resourceId,
        dashboardType: DashboardType.CreateProxyDashboard,
        node: null,
        data: {},
        siteDescriptor: new ArmSiteDescriptor(this.resourceId),
        functionDescriptor: new ArmFunctionDescriptor(this.resourceId),
      };
      broadcastService.broadcastEvent(BroadcastEvent.TreeNavigation, viewInfo);
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
  }
}
