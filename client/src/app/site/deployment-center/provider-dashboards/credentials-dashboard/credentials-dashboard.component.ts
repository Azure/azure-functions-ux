import { FeatureComponent } from 'app/shared/components/feature-component';
import { OnDestroy, Component, Injector, Input } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { CredentialsData } from '../../Models/deployment-data';
import { SiteService } from 'app/shared/services/site.service';
import { AuthzService } from 'app/shared/services/authz.service';
import { SiteAvailabilityState } from 'app/shared/models/arm/site';

@Component({
  selector: 'app-credentials-dashboard',
  templateUrl: './credentials-dashboard.component.html',
  styleUrls: ['./credentials-dashboard.component.scss', '../../deployment-center-setup/deployment-center-setup.component.scss'],
})
export class CredentialsDashboardComponent extends FeatureComponent<CredentialsData> implements OnDestroy {
  private _ngUnsubscribe$ = new Subject();
  private _credentialsData: CredentialsData;
  public siteAvailabilityStateNormal = false;
  public hasWriteAccess = false;
  public localGitTabClass = 'link link-selected';
  public ftpsTabClass = 'link';

  @Input()
  set credentialsData(credentialsData: CredentialsData) {
    this.setInput(credentialsData);
  }
  constructor(private _siteService: SiteService, private _authZService: AuthzService, injector: Injector) {
    super('CredentialsDashboardComponent', injector);
  }

  protected setup(inputEvents: Observable<CredentialsData>) {
    return inputEvents
      .distinctUntilChanged()
      .switchMap(credentialsData => {
        this._credentialsData = credentialsData;
        return Observable.zip(
          this._authZService.hasPermission(this._credentialsData.resourceId, [AuthzService.writeScope]),
          this._siteService.getSite(this._credentialsData.resourceId),
          this._siteService.getSiteConfig(this._credentialsData.resourceId),
          (hasWriteAccess, siteResponse, siteConfigResponse) => ({
            hasWriteAccess,
            siteResponse,
            siteConfigResponse,
          })
        );
      })
      .do(responses => {
        this.hasWriteAccess = responses.hasWriteAccess;
        this.siteAvailabilityStateNormal =
          responses.siteResponse &&
          responses.siteResponse.isSuccessful &&
          responses.siteResponse.result &&
          responses.siteResponse.result.properties.availabilityState === SiteAvailabilityState.Normal;
      });
  }

  public ngOnDestroy() {
    this._ngUnsubscribe$.next();
    super.ngOnDestroy();
  }

  public refresh() {}

  public downloadPublishProfile() {}

  public resetPublishCredentials() {}

  public showLocalGitCredentials() {
    this._resetTabs();
    this.localGitTabClass = 'link link-selected';
  }

  public showFtpsCredentials() {
    this._resetTabs();
    this.ftpsTabClass = 'link link-selected';
  }

  private _resetTabs() {
    this.localGitTabClass = 'link';
    this.ftpsTabClass = 'link';
  }
}
