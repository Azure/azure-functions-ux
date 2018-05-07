import { Component, Input, OnInit } from '@angular/core';
import { Links } from '../../../../shared/models/constants';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { SiteService } from '../../../../shared/services/site.service';
import { CacheService } from '../../../../shared/services/cache.service';
import { PublishingProfile } from '../../Models/publishing-profile';
import { from } from 'rxjs/observable/from';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { ArmSiteDescriptor } from '../../../../shared/resourceDescriptors';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../../shared/models/portal-resources';
@Component({
  selector: 'app-ftp-dashboard',
  templateUrl: './ftp-dashboard.component.html',
  styleUrls: ['./ftp-dashboard.component.scss', '../../deployment-center-setup/deployment-center-setup.component.scss']
})
export class FtpDashboardComponent implements OnInit {
  public FwLinks = Links;
  @Input() resourceId;

  public FTPAccessOptions =
    [{ displayLabel: this._translateService.instant(PortalResources.FTPBoth), value: 'AllAllowed' },
    { displayLabel: this._translateService.instant(PortalResources.FTPSOnly), value: 'FtpsOnly' },
    { displayLabel: this._translateService.instant(PortalResources.FTPDisable), value: 'Disabled' }];

  public sidePanelOpened = false;
  public animate = false;
  public ftpsEnabledControl = new FormControl('Disabled');
  public ftpsEndpoint = '';

  public load$ = new Subject();
  public save$ = new Subject();
  private _ngUnsubscribe$ = new Subject();
  private _blobUrl: string;
  public publishProfileLink: SafeUrl;
  public siteName: string;

  constructor(
    private _translateService: TranslateService,
    _siteService: SiteService,
    private _cacheService: CacheService,
    private _domSanitizer: DomSanitizer) {

    this.load$.takeUntil(this._ngUnsubscribe$)
      .switchMap(() => _siteService.getSiteConfig(this.resourceId))
      .subscribe(siteConfig => {
        if (siteConfig.isSuccessful) {
          this.ftpsEnabledControl.reset();
          this.ftpsEnabledControl.setValue(siteConfig.result.properties.ftpsState);
        }
      });

    this.save$.takeUntil(this._ngUnsubscribe$)
      .switchMap(() => {
        return _cacheService.patchArm(`${this.resourceId}/config/web`, null, {
          properties: {
            ftpsState: this.ftpsEnabledControl.value
          }
        }
        );
      })
      .subscribe(() => {
        this.ftpsEnabledControl.markAsPristine();
      });
  }

  ngOnInit() {
    this.load$.next();
    this.animate = true;
    const resourceDesc = new ArmSiteDescriptor(this.resourceId);
    this.siteName = resourceDesc.site;
    this._cacheService.postArm(`${this.resourceId}/publishxml`, true)
      .switchMap(r => from(PublishingProfile.parsePublishProfileXml(r.text())))
      .filter(x => x.publishMethod === 'FTP')
      .subscribe(ftpProfile => {
        this.ftpsEndpoint = ftpProfile.publishUrl.replace('ftp:/', 'ftps:/');
      });

  }
  openDeploymentCredentials() {
    this.sidePanelOpened = !this.sidePanelOpened;
  }

  downloadPublishProfile() {
    this._cacheService.postArm(`${this.resourceId}/publishxml`, true)
      .subscribe(response => {
        const publishXml = response.text();

        // http://stackoverflow.com/questions/24501358/how-to-set-a-header-for-a-http-get-request-and-trigger-file-download/24523253#24523253
        const windowUrl = window.URL || (<any>window).webkitURL;
        const blob = new Blob([publishXml], { type: 'application/octet-stream' });
        this._cleanupBlob();

        if (window.navigator.msSaveOrOpenBlob) {
          // Currently, Edge doesn' respect the "download" attribute to name the file from blob
          // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/7260192/
          window.navigator.msSaveOrOpenBlob(blob, `${this.siteName}.PublishSettings`);
        } else {
          // http://stackoverflow.com/questions/37432609/how-to-avoid-adding-prefix-unsafe-to-link-by-angular2
          this._blobUrl = windowUrl.createObjectURL(blob);
          this.publishProfileLink = this._domSanitizer.bypassSecurityTrustUrl(this._blobUrl);

          setTimeout(() => {
            const hiddenLink = document.getElementById('hidden-publish-profile-link-ftp');
            hiddenLink.click();
            this.publishProfileLink = null;
          });
        }
      });
  }

  private _cleanupBlob() {
    const windowUrl = window.URL || (<any>window).webkitURL;
    if (this._blobUrl) {
      windowUrl.revokeObjectURL(this._blobUrl);
      this._blobUrl = null;
    }
  }
  save = () => this.save$.next();
}
