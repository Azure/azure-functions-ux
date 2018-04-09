import { NewPlanSpeckPickerData } from './../price-spec-manager/plan-price-spec-manager';
import { Component } from '@angular/core';
import { TreeViewInfo } from '../../../tree-view/models/tree-view-info';
import { TranslateService } from '@ngx-translate/core';
import { DashboardType } from '../../../tree-view/models/dashboard-type';
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
  }
}
