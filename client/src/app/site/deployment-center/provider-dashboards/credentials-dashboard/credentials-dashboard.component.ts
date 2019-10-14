import { FeatureComponent } from 'app/shared/components/feature-component';
import { OnDestroy, Component, Injector, Input, ViewChild, ElementRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { CredentialsData } from '../../Models/deployment-data';
import { SiteService } from 'app/shared/services/site.service';
import { AuthzService } from 'app/shared/services/authz.service';
import { SiteAvailabilityState } from 'app/shared/models/arm/site';
import { Dom } from '../../../../shared/Utilities/dom';
import { KeyCodes } from '../../../../shared/models/constants';

@Component({
  selector: 'app-credentials-dashboard',
  templateUrl: './credentials-dashboard.component.html',
  styleUrls: ['./credentials-dashboard.component.scss', '../../deployment-center-setup/deployment-center-setup.component.scss'],
})
export class CredentialsDashboardComponent extends FeatureComponent<CredentialsData> implements OnDestroy {
  private _ngUnsubscribe$ = new Subject();
  private _credentialsData: CredentialsData;
  private _currentTabIndex: number;

  public siteAvailabilityStateNormal = false;
  public hasWriteAccess = false;
  public localGitTabClass = 'credential-tab credential-tab-selected';
  public ftpsTabClass = 'credential-tab';
  public activeTab: 'localGit' | 'ftps' = 'localGit';
  public ftpsEndpoint = 'FTPS endpoint';
  public gitEndpoint = 'Git endpoint';

  @ViewChild('credsTabs')
  groupElements: ElementRef;

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

  public selectTab(tab) {
    this.activeTab = tab;
    this._currentTabIndex = this.activeTab === 'localGit' ? 0 : 1;
  }

  public onKeyPress(event: KeyboardEvent, info: 'app' | 'user') {
    if (event.keyCode === KeyCodes.enter || event.keyCode === KeyCodes.space) {
      this.selectTab(info);
      event.preventDefault();
    } else if (event.keyCode === KeyCodes.arrowRight) {
      const tabElements = this._getTabElements();
      this._clearFocusOnTab(tabElements, this._currentTabIndex);
      this._setFocusOnTab(tabElements, this._currentTabIndex + 1);
      event.preventDefault();
    } else if (event.keyCode === KeyCodes.arrowLeft) {
      const tabElements = this._getTabElements();
      this._clearFocusOnTab(tabElements, this._currentTabIndex);
      this._setFocusOnTab(tabElements, this._currentTabIndex - 1);
      event.preventDefault();
    }
  }

  private _getTabElements() {
    return this.groupElements.nativeElement.children;
  }

  private _clearFocusOnTab(elements: HTMLCollection, index: number) {
    const oldFeature = Dom.getTabbableControl(<HTMLElement>elements[index]);
    Dom.clearFocus(oldFeature);
  }

  private _setFocusOnTab(elements: HTMLCollection, index: number) {
    let finalIndex = -1;
    let destFeature: Element;

    // Wrap around logic for navigating through a tab list
    if (elements.length > 0) {
      if (index > 0 && index < elements.length) {
        finalIndex = index;
      } else if (index === -1) {
        finalIndex = elements.length - 1;
      } else {
        finalIndex = 0;
      }
      destFeature = elements[finalIndex];
    }

    this._currentTabIndex = finalIndex;

    if (destFeature) {
      const newFeature = Dom.getTabbableControl(<HTMLElement>destFeature);
      Dom.setFocus(<HTMLElement>newFeature);
    }
  }
}
