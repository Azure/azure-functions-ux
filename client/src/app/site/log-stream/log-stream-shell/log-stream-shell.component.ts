import { Component } from '@angular/core';
import { TreeViewInfo } from '../../../tree-view/models/tree-view-info';
import { TranslateService } from '@ngx-translate/core';
import { DashboardType } from '../../../tree-view/models/dashboard-type';
import { UserService } from '../../../shared/services/user.service';
import { StartupInfo } from '../../../shared/models/portal';
import { LogStreamInput } from '../log-stream';

@Component({
  selector: 'log-stream-shell',
  templateUrl: './log-stream-shell.component.html',
})
export class LogStreamShellComponent {
  viewInfo: TreeViewInfo<void>;

  constructor(translateService: TranslateService, userService: UserService) {
    userService.getStartupInfo()
      .first()
      .subscribe((info: StartupInfo<LogStreamInput<void>>) => {

        if (info.featureInfo && info.featureInfo.id) {
          this.viewInfo = {
            resourceId: info.featureInfo.id,
            dashboardType: DashboardType.none,
            node: null,
            data: null,
          };
        }
      });
  }
}
