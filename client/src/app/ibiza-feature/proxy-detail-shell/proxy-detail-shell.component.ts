import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { ArmFunctionDescriptor, ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { TreeViewInfo } from 'app/tree-view/models/tree-view-info';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'proxy-detail-shell',
  templateUrl: './proxy-detail-shell.component.html',
})
export class ProxyDetailShellComponent implements OnDestroy {
  resourceId: string;
  ngUnsubscribe: Subject<void>;
  data: any;

  constructor(broadcastService: BroadcastService, route: ActivatedRoute, private _userService: UserService) {
    this.ngUnsubscribe = new Subject<void>();

    route.params.takeUntil(this.ngUnsubscribe).subscribe(param => {
      this.resourceId = `${ArmFunctionDescriptor.generateResourceUri(
        param['subscriptionId'],
        param['resourceGroup'],
        param['site'],
        param['slot']
      )}`;

      this._userService.getStartupInfo().subscribe(info => {
        this.data = info.featureInfo && info.featureInfo.data ? info.featureInfo.data : null;
      });

      const viewInfo = <TreeViewInfo<any>>{
        resourceId: this.resourceId,
        dashboardType: DashboardType.ProxyDashboard,
        node: null,
        data: this.data,
        siteDescriptor: new ArmSiteDescriptor(this.resourceId),
        functionDescriptor: null,
      };
      broadcastService.broadcastEvent(BroadcastEvent.TreeNavigation, viewInfo);
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
  }
}
