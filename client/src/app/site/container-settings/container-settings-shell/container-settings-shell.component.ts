import { Component } from '@angular/core';
import { TreeViewInfo } from '../../../tree-view/models/tree-view-info';
import { TranslateService } from '@ngx-translate/core';
import { DashboardType } from '../../../tree-view/models/dashboard-type';
import { UserService } from '../../../shared/services/user.service';
import { StartupInfo } from '../../../shared/models/portal';
import { ContainerSettingsData, ContainerSettingsInput } from '../container-settings';

@Component({
  selector: 'container-settings-shell',
  templateUrl: './container-settings-shell.component.html',
  styleUrls: ['./container-settings-shell.component.scss']
})
export class ContainerSettingsShellComponent {
  viewInfo: TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>;

  constructor(translateService: TranslateService, userService: UserService) {
    userService.getStartupInfo()
      .first()
      .subscribe((info: StartupInfo<ContainerSettingsInput<ContainerSettingsData>>) => {

        if (info.featureInfo && info.featureInfo.id) {
          this.viewInfo = {
            resourceId: info.featureInfo.id,
            dashboardType: DashboardType.none,
            node: null,
            data: info.featureInfo
          };

        }
      });
  }
}
