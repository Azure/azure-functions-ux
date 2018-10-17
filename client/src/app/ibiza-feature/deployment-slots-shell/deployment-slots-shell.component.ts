import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { TreeViewInfo, SiteData } from './../../tree-view/models/tree-view-info';
import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-deployment-slots-shell',
  templateUrl: './deployment-slots-shell.component.html',
  styleUrls: ['./deployment-slots-shell.component.scss'],
})
export class DeploymentSlotsShellComponent implements OnDestroy {
  viewInfo: TreeViewInfo<SiteData>;
  swapMode: boolean;
  ngUnsubscribe: Subject<void>;

  constructor(translateService: TranslateService, route: ActivatedRoute) {
    this.ngUnsubscribe = new Subject<void>();

    route.params.takeUntil(this.ngUnsubscribe).subscribe(x => {
      this.viewInfo = {
        resourceId:
          `/subscriptions/${x['subscriptionId']}/resourceGroups/${x['resourceGroup']}/providers/Microsoft.Web/sites/${x['site']}` +
          (x['slot'] ? `/slots/${x['slot']}` : ``),
        dashboardType: DashboardType.none,
        node: null,
        data: null,
      };

      if (x['action'] && x['action'] === 'swap') {
        this.swapMode = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
  }
}
