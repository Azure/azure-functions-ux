import { NewPlanSpeckPickerData } from './../price-spec-manager/plan-price-spec-manager';
import { Component } from '@angular/core';
import { TreeViewInfo } from '../../../tree-view/models/tree-view-info';
// import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
// import { ActivatedRoute } from '@angular/router';
import { DashboardType } from '../../../tree-view/models/dashboard-type';
// import { ResourceId } from '../../../shared/models/arm/arm-obj';
import { UserService } from '../../../shared/services/user.service';
import { SpecPickerInput } from '../price-spec-manager/plan-price-spec-manager';
import { StartupInfo } from '../../../shared/models/portal';

@Component({
  selector: 'spec-picker-feature-wrapper',
  templateUrl: './spec-picker-feature-wrapper.component.html',
  styleUrls: ['./spec-picker-feature-wrapper.component.scss']
})
export class SpecPickerFeatureWrapperComponent {
  viewInfo: TreeViewInfo<SpecPickerInput<NewPlanSpeckPickerData>>;

  // private _ngUnsubscribe = new Subject();

  constructor(translateService: TranslateService, userService: UserService) {
    userService.getStartupInfo()
      .first()
      .subscribe((info: StartupInfo<SpecPickerInput<NewPlanSpeckPickerData>>) => {
        this.viewInfo = {
          resourceId: info.featureInfo.id,
          dashboardType: DashboardType.none,
          node: null,
          data: info.featureInfo
        };
      });
    // let routeParams: { [key: string]: any } = null;

    // route.params
    //   .takeUntil(this._ngUnsubscribe)
    //   .switchMap(p => {
    //     routeParams = p;
    //     return userService.getStartupInfo().first();
    //   })
    //   .subscribe(info => {
    //     const subscriptionId = routeParams['subscriptionId'];
    //     const rg = routeParams['resourceGroup'];
    //     const serverFarm = routeParams['serverfarm'];
    //     let resourceId: ResourceId;

    //     if (rg && serverFarm) {
    //       resourceId = `/subscriptions/${subscriptionId}/resourceGroups/${rg}/providers/Microsoft.Web/serverfarms/${serverFarm}`;
    //     } else {
    //       resourceId = `/subscriptions/${subscriptionId}`;
    //     }

    //     this.viewInfo = {
    //       resourceId: resourceId,
    //       dashboardType: DashboardType.none,
    //       node: null,
    //       data: info.featureInfo
    //     };
    //   });
  }

  // ngOnDestroy(): void {
  //   this._ngUnsubscribe.next();
  // }
}