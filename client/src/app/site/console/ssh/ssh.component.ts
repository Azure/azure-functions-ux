import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConsoleService } from './../shared/services/console.service';
import { Site, HostType } from '../../../shared/models/arm/site';
import { ArmObj } from '../../../shared/models/arm/arm-obj';
import { Subscription } from 'rxjs/Subscription';
import { BusyStateScopeManager } from '../../../busy-state/busy-state-scope-manager';
import { BroadcastService } from '../../../shared/services/broadcast.service';
import { SiteTabIds } from '../../../shared/models/constants';

@Component({
  selector: 'app-ssh',
  templateUrl: './ssh.component.html',
  styleUrls: ['./../console.component.scss', './ssh.component.scss'],
})
export class SSHComponent implements OnInit, OnDestroy {
  public sshUrl = '';
  protected site: ArmObj<Site>;
  private _siteSubscription: Subscription;
  private _busyManager: BusyStateScopeManager;

  constructor(private _consoleService: ConsoleService, private _broadcastService: BroadcastService) {
    this._busyManager = new BusyStateScopeManager(this._broadcastService, SiteTabIds.console);
    this._busyManager.setBusy();
  }

  ngOnInit() {
    this._siteSubscription = this._consoleService.getSite().subscribe(site => {
      this.site = site;
      this.sshUrl = this.getKuduUri();
    });
  }

  ngOnDestroy() {
    this._siteSubscription.unsubscribe();
  }

  /**
   * Check when the iframe is loaded
   */
  iframeLoaded() {
    this._busyManager.clearBusy();
  }

  /**
   * Reconnect the SSH on Button click
   */
  reconnect() {
    this.sshUrl = '';
    this._busyManager.setBusy();
    setTimeout(() => {
      this.sshUrl = this.getKuduUri();
    }, 50);
  }

  /**
   * Get Kudu API URL
   */
  public getKuduUri(): string {
    const scmHostName = this.site.properties.hostNameSslStates.find(h => h.hostType === HostType.Repository).name;
    return `https://${scmHostName}/webssh/host`;
  }
}
