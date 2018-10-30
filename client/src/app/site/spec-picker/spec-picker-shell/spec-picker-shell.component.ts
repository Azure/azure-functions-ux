import { PlanSpecPickerData } from './../price-spec-manager/plan-price-spec-manager';
import { Component } from '@angular/core';
import { TreeViewInfo } from '../../../tree-view/models/tree-view-info';
import { TranslateService } from '@ngx-translate/core';
import { DashboardType } from '../../../tree-view/models/dashboard-type';
import { UserService } from '../../../shared/services/user.service';
import { SpecPickerInput } from '../price-spec-manager/plan-price-spec-manager';
import { StartupInfo } from '../../../shared/models/portal';

@Component({
  selector: 'spec-picker-shell',
  templateUrl: './spec-picker-shell.component.html',
  styleUrls: ['./spec-picker-shell.component.scss'],
})
export class SpecPickerShellComponent {
  viewInfo: TreeViewInfo<SpecPickerInput<PlanSpecPickerData>>;

  constructor(translateService: TranslateService, userService: UserService) {
    userService
      .getStartupInfo()
      .first()
      .subscribe((info: StartupInfo<SpecPickerInput<PlanSpecPickerData>>) => {
        if (info.featureInfo && info.featureInfo.id) {
          this.viewInfo = {
            resourceId: info.featureInfo.id,
            dashboardType: DashboardType.none,
            node: null,
            data: info.featureInfo,
          };
        }
      });
  }
}
