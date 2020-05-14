import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { ArmFunctionDescriptor } from 'app/shared/resourceDescriptors';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { TreeViewInfo } from 'app/tree-view/models/tree-view-info';
import { DashboardType } from 'app/tree-view/models/dashboard-type';

@Component({
  selector: 'function-monitor-shell',
  templateUrl: './function-monitor-shell.component.html',
})
export class FunctionMonitorShellComponent implements OnDestroy {
  resourceId: string;
  ngUnsubscribe: Subject<void>;

  constructor(broadcastService: BroadcastService, route: ActivatedRoute) {
    this.ngUnsubscribe = new Subject<void>();

    route.params.takeUntil(this.ngUnsubscribe).subscribe(param => {
      this.resourceId = ArmFunctionDescriptor.generateResourceUri(
        param['subscriptionId'],
        param['resourceGroup'],
        param['site'],
        param['slot'],
        param['function']
      );

      const viewInfo = <TreeViewInfo<any>>{
        resourceId: this.resourceId,
        dashboardType: DashboardType.FunctionMonitorDashboard,
        node: null,
        data: {},
      };
      broadcastService.broadcastEvent(BroadcastEvent.TreeNavigation, viewInfo);
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
  }
}
