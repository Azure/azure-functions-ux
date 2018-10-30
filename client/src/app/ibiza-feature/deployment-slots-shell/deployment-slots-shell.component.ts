import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { TreeViewInfo, SiteData } from './../../tree-view/models/tree-view-info';
import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';

@Component({
  selector: 'app-deployment-slots-shell',
  templateUrl: './deployment-slots-shell.component.html',
  styleUrls: ['./deployment-slots-shell.component.scss'],
})
export class DeploymentSlotsShellComponent implements OnDestroy {
  viewInfo: TreeViewInfo<SiteData>;
  ngUnsubscribe: Subject<void>;

  constructor(translateService: TranslateService, route: ActivatedRoute) {
    this.ngUnsubscribe = new Subject<void>();

    route.params.takeUntil(this.ngUnsubscribe).subscribe(x => {
      this.viewInfo = {
        resourceId: ArmSiteDescriptor.generateResourceUri(x['subscriptionId'], x['resourceGroup'], x['site'], x['slot']),
        dashboardType: DashboardType.none,
        node: null,
        data: null,
      };
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
  }
}
