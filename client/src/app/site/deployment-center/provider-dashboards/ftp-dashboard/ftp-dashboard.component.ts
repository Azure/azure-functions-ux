import { Component, Input, OnInit, Injector, OnDestroy } from '@angular/core';
import { Links } from '../../../../shared/models/constants';
import { Subject } from 'rxjs/Subject';
import { SiteService } from '../../../../shared/services/site.service';
import { PublishingProfile } from '../../Models/publishing-profile';
import { from } from 'rxjs/observable/from';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { ArmSiteDescriptor } from '../../../../shared/resourceDescriptors';
import { FeatureComponent } from '../../../../shared/components/feature-component';
import { Observable } from 'rxjs/Observable';
@Component({
  selector: 'app-ftp-dashboard',
  templateUrl: './ftp-dashboard.component.html',
  styleUrls: ['./ftp-dashboard.component.scss', '../../deployment-center-setup/deployment-center-setup.component.scss'],
})
export class FtpDashboardComponent extends FeatureComponent<string> implements OnInit, OnDestroy {
  public FwLinks = Links;
  @Input()
  resourceId;

  public ftpsEndpoint = '';

  private _ngUnsubscribe$ = new Subject();
  private _blobUrl: string;
  public publishProfileLink: SafeUrl;
  public siteName: string;
  constructor(private _siteService: SiteService, private _domSanitizer: DomSanitizer, injector: Injector) {
    super('FtpDashboardComponent', injector);
  }

  protected setup(inputEvents: Observable<string>) {
    return inputEvents
      .switchMap(() => this._siteService.getPublishingProfile(this.resourceId))
      .switchMap(r => from(PublishingProfile.parsePublishProfileXml(r.result)))
      .first(x => x.publishMethod === 'FTP')
      .do(ftpProfile => {
        this.ftpsEndpoint = ftpProfile.publishUrl.replace('ftp:/', 'ftps:/');
      });
  }

  ngOnInit() {
    const resourceDesc = new ArmSiteDescriptor(this.resourceId);
    this.siteName = resourceDesc.site;
    super.setInput(this.resourceId);
  }

  ngOnDestroy() {
    this._ngUnsubscribe$.next();
    this._cleanupBlob();
    super.ngOnDestroy();
  }

  downloadPublishProfile() {
    this._siteService.getPublishingProfile(this.resourceId).subscribe(response => {
      const publishXml = response.result;

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
}
