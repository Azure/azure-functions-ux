import { Component, OnInit, OnDestroy} from '@angular/core';
import { ConsoleService } from './../shared/services/console.service';
import { Site } from '../../../shared/models/arm/site';
import { ArmObj } from '../../../shared/models/arm/arm-obj';
import { Subscription } from 'rxjs/Subscription';
import { BusyStateScopeManager } from '../../../busy-state/busy-state-scope-manager';
import { BroadcastService } from '../../../shared/services/broadcast.service';
import { SiteTabIds } from '../../../shared/models/constants';

@Component({
  selector: 'app-ssh',
  templateUrl: './ssh.component.html',
  styleUrls: ['./../console.component.scss', './ssh.component.scss']
})
export class SSHComponent implements OnInit, OnDestroy {

  public sshUrl = '';
  protected site: ArmObj<Site>;
  private _isLoaded = false;
  private _siteSubscription: Subscription;
  private _busyManager: BusyStateScopeManager;

  constructor(
    private _consoleService: ConsoleService,
    private _broadcastService: BroadcastService
    ) {
      this._busyManager = new BusyStateScopeManager(this._broadcastService, SiteTabIds.console);
      this._busyManager.setBusy();
    }

  ngOnInit() {
      this._siteSubscription = this._consoleService.getSite().subscribe(site => {
          this.site = site;
          this.sshUrl = this._getKuduUri();
      });
  }

  ngOnDestroy() {
      this._siteSubscription.unsubscribe();
  }

  /**
   * Check when the iframe is loaded
   */
  iframeLoaded() {
      if (this._isLoaded) {
          this._busyManager.clearBusy();
          return;
      }
      this._isLoaded = true;
  }

  /**
   * Reconnect the SSH on Button click
   */
  reconnect() {
      this._isLoaded = false;
      this.sshUrl = '';
      this._busyManager.setBusy();
      setTimeout(() => {
          this.sshUrl = this._getKuduUri();
      }, 1000);
  }

  /**
   * Get Kudu API URL
   */
  private _getKuduUri(): string {
      const scmHostName = this.site.properties.hostNameSslStates.find (h => h.hostType === 1).name;
      return `https://${scmHostName}/webssh/host`;
  }
}
