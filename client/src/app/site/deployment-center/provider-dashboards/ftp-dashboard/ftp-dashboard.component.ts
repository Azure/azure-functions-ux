import { Component, Input } from '@angular/core';
import { BroadcastService } from '../../../../shared/services/broadcast.service';
import { BroadcastEvent } from '../../../../shared/models/broadcast-event';
import { Links } from '../../../../shared/models/constants';

@Component({
  selector: 'app-ftp-dashboard',
  templateUrl: './ftp-dashboard.component.html',
  styleUrls: ['./ftp-dashboard.component.scss', '../../deployment-center-setup/deployment-center-setup.component.scss']
})
export class FtpDashboardComponent {
  public FwLinks = Links;
  @Input() resourceId;

  public FTPAccessOptions =
            [{ displayLabel: 'FTP + FTPS', value: 'AllAllowed' },
            { displayLabel: 'FTPS Only', value: 'FtpsOnly' },
            { displayLabel: 'Disable', value: 'Disabled' }];

  constructor(private _broadcastService: BroadcastService) { }

  openDeploymentCredentials() {

  }

  exit() {
    this._broadcastService.broadcast(BroadcastEvent.ReloadDeploymentCenter);
  }

  refresh() {

  }
}
