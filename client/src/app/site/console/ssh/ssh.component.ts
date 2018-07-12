import { Component, OnInit, OnDestroy} from '@angular/core';
import { ConsoleService } from './../services/console.service';
import { Site } from '../../../shared/models/arm/site';
import { ArmObj } from '../../../shared/models/arm/arm-obj';
import { PublishingCredentials } from '../../../shared/models/publishing-credentials';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-ssh',
  templateUrl: './ssh.component.html',
  styleUrls: ['./../console.component.scss']
})
export class SSHComponent implements OnInit, OnDestroy {

  protected site: ArmObj<Site>;
  protected publishingCredentials: ArmObj<PublishingCredentials>;
  public resourceId: string;
  private _resourceIdSubscription: Subscription;
  private _siteSubscription: Subscription;
  private _publishingCredSubscription: Subscription;
  constructor(
    private _consoleService: ConsoleService
    ) {

    }

  ngOnInit() {
    this._resourceIdSubscription = this._consoleService.getResourceId().subscribe(resourceId => {
        this.resourceId = resourceId; });
    this._siteSubscription = this._consoleService.getSite().subscribe(site => {
        this.site = site; });
    this._publishingCredSubscription = this._consoleService.getPublishingCredentials().subscribe(publishingCredentials => {
        this.publishingCredentials = publishingCredentials;
    });
  }

  ngOnDestroy() {
    this._resourceIdSubscription.unsubscribe();
    this._siteSubscription.unsubscribe();
    this._publishingCredSubscription.unsubscribe();
  }

  /**
   * Get Kudu API URL
   */
  protected getKuduUri(): string {
    const scmHostName = this.site ? (this.site.properties.hostNameSslStates.find (h => h.hostType === 1).name) : 'funcplaceholder01.scm.azurewebsites.net';
    return `https://${scmHostName}/webssh/host`;
  }

}
