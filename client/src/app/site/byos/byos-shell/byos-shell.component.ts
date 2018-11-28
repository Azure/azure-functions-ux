import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../shared/services/user.service';
import { StartupInfo } from '../../../shared/models/portal';
import { ByosInput, ByosInputData } from '../byos';

@Component({
  selector: 'byos-shell',
  templateUrl: './byos-shell.component.html',
  styleUrls: ['./byos-shell.component.scss'],
})
export class ByosShellComponent {
  viewInfo: ByosInput<ByosInputData>;

  constructor(translateService: TranslateService, userService: UserService) {
    userService
      .getStartupInfo()
      .first()
      .subscribe((info: StartupInfo<ByosInput<ByosInputData>>) => {
        if (info.featureInfo && info.featureInfo.id) {
          this.viewInfo = info.featureInfo;
        }
      });
  }
}
