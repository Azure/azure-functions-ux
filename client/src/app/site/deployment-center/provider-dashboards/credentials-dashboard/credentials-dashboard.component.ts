import { FeatureComponent } from 'app/shared/components/feature-component';
import { OnDestroy, Component, Injector, Input, ViewChild, ElementRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { CredentialsData } from '../../Models/deployment-data';
import { SiteService } from 'app/shared/services/site.service';
import { AuthzService } from 'app/shared/services/authz.service';
import { SiteAvailabilityState } from 'app/shared/models/arm/site';
import { Dom } from '../../../../shared/Utilities/dom';
import { KeyCodes, Links } from '../../../../shared/models/constants';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';
import { RegexValidator } from 'app/shared/validators/regexValidator';
import { ConfirmPasswordValidator } from 'app/shared/validators/passwordValidator';
import { from } from 'rxjs/observable/from';
import { PublishingProfile } from '../../Models/publishing-profile';
import { PublishingUser } from 'app/shared/models/arm/publishing-users';
import { PortalService } from 'app/shared/services/portal.service';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { SelectOption } from 'app/shared/models/select-option';
import { PublishingCredentials } from 'app/shared/models/publishing-credentials';

export type CredentialScopeType = 'AppCredentials' | 'UserCredentials';
export type CredentialsType = 'localGit' | 'ftps';

@Component({
  selector: 'app-credentials-dashboard',
  templateUrl: './credentials-dashboard.component.html',
  styleUrls: ['./credentials-dashboard.component.scss', '../../deployment-center-setup/deployment-center-setup.component.scss'],
})
export class CredentialsDashboardComponent extends FeatureComponent<CredentialsData> implements OnDestroy {
  private _ngUnsubscribe$ = new Subject();
  private _credentialsData: CredentialsData;
  private _currentTabIndex: number;
  private _resetPublishingProfile$ = new Subject();
  private _saveUserCredentials$ = new Subject();
  private _blobUrl: string;

  public siteAvailabilityStateNormal = false;
  public hasWriteAccess = false;
  public localGitTabClass = 'credential-tab credential-tab-selected';
  public ftpsTabClass = 'credential-tab';
  public activeTab: 'localGit' | 'ftps';
  public ftpsEndpoint = 'FTPS endpoint';
  public gitEndpoint = 'Git endpoint';
  public userCredsDesc = '';
  public localGit = false;
  public userPasswordForm: FormGroup;
  public appUserName: string;
  public appPwd: string;
  public saving = false;
  public resetting = false;
  public publishProfileLink: SafeUrl;
  public profileName: string = '';
  public learnMoreLink = Links.deploymentCredentialsLearnMore;

  public scopeItems: SelectOption<CredentialScopeType>[] = [];

  public selectedScope: CredentialScopeType = 'AppCredentials';

  @ViewChild('credsTabs')
  groupElements: ElementRef;

  @Input()
  set credentialsData(credentialsData: CredentialsData) {
    this.setInput(credentialsData);
  }
  constructor(
    private _siteService: SiteService,
    private _authZService: AuthzService,
    private _translateService: TranslateService,
    private _fb: FormBuilder,
    private _portalService: PortalService,
    private _domSanitizer: DomSanitizer,
    injector: Injector
  ) {
    super('CredentialsDashboardComponent', injector);

    this.scopeItems = [
      {
        displayLabel: this._translateService.instant(PortalResources.appCreds),
        value: 'AppCredentials',
      },
      {
        displayLabel: this._translateService.instant(PortalResources.userCreds),
        value: 'UserCredentials',
      },
    ];

    this._setupUserPasswordForm();
    this._setupResetPublishProfileEvent();
    this._setupSaveCredentialsEvent();
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
          this._siteService.getPublishingUser(),
          this._siteService
            .getPublishingProfile(this._credentialsData.resourceId)
            .switchMap(r => from(PublishingProfile.parsePublishProfileXml(r.result)).first(x => x.publishMethod === 'FTP')),
          this._siteService.getPublishingCredentials(this._credentialsData.resourceId),
          (hasWriteAccess, siteResponse, siteConfigResponse, publishingUser, publishingFtpProfile, publishingCredentials) => ({
            hasWriteAccess,
            siteResponse,
            siteConfigResponse,
            publishingUser,
            publishingFtpProfile,
            publishingCredentials,
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

        this.localGit = responses.siteConfigResponse.result.properties.scmType === 'LocalGit';
        this.activeTab = this.localGit ? 'localGit' : 'ftps';

        const siteDescriptor = new ArmSiteDescriptor(this._credentialsData.resourceId);
        const siteName = siteDescriptor.site;
        const slotName = siteDescriptor.slot;

        this.profileName = slotName ? `${siteName}_${slotName}` : siteName;

        this._setupEndpoints(responses.publishingFtpProfile, responses.publishingCredentials.result.properties, siteName);
        this._setupAppCredentials(responses.publishingFtpProfile);
        this._setupUserCredentials(responses.publishingUser.result.properties, siteName, slotName);
      });
  }

  public ngOnDestroy() {
    this._cleanupBlob();
    this._ngUnsubscribe$.next();
    super.ngOnDestroy();
  }

  public refresh() {
    this._cleanupBlob();
    this.setInput({
      resourceId: this._credentialsData.resourceId,
    });
  }

  public downloadPublishProfile() {
    const siteDescriptor = new ArmSiteDescriptor(this._credentialsData.resourceId);
    const siteName = siteDescriptor.site;

    this._siteService.getPublishingProfile(this._credentialsData.resourceId).subscribe(response => {
      const publishXml = response.result;

      // http://stackoverflow.com/questions/24501358/how-to-set-a-header-for-a-http-get-request-and-trigger-file-download/24523253#24523253
      const windowUrl = window.URL || (<any>window).webkitURL;
      const blob = new Blob([publishXml], { type: 'application/octet-stream' });
      this._cleanupBlob();

      if (window.navigator.msSaveOrOpenBlob) {
        // Currently, Edge doesn' respect the "download" attribute to name the file from blob
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/7260192/
        window.navigator.msSaveOrOpenBlob(blob, `${siteName}.PublishSettings`);
      } else {
        // http://stackoverflow.com/questions/37432609/how-to-avoid-adding-prefix-unsafe-to-link-by-angular2
        this._blobUrl = windowUrl.createObjectURL(blob);
        this.publishProfileLink = this._domSanitizer.bypassSecurityTrustUrl(this._blobUrl);

        setTimeout(() => {
          const hiddenLink = document.getElementById('hidden-publish-profile-link-credentials');
          hiddenLink.click();
          this.publishProfileLink = null;
        });
      }
    });
  }

  public resetPublishingProfile = () => this._resetPublishingProfile$.next();

  public saveUserCredentails = () => this._saveUserCredentials$.next();

  public scopeChanged(scope: CredentialScopeType) {
    this.selectedScope = scope;
  }

  public selectTab(tab: CredentialsType) {
    this.activeTab = tab;
    this._currentTabIndex = this.activeTab === 'localGit' ? 0 : 1;
  }

  public get disableRefreshCommand() {
    return !this.siteAvailabilityStateNormal || !this.hasWriteAccess;
  }

  public get disableDownloadPublishProfileCommand() {
    return !this.siteAvailabilityStateNormal || !this.hasWriteAccess;
  }

  public get disableResetPublishProfileCommand() {
    return !this.siteAvailabilityStateNormal || !this.hasWriteAccess || this.resetting || this.selectedScope === 'UserCredentials';
  }

  public onKeyPress(event: KeyboardEvent, info: CredentialsType) {
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

  private _setupAppCredentials(ftpProfile: PublishingProfile) {
    if (this.localGit) {
      this.appUserName = ftpProfile.userName.split('\\')[1];
    } else {
      this.appUserName = ftpProfile.userName;
    }

    this.appPwd = ftpProfile.userPWD;
  }

  private _setupUserCredentials(publishingUser: PublishingUser, siteName: string, slotName: string) {
    if (slotName) {
      siteName = `${siteName}__${slotName}`;
    }
    this.userCredsDesc = publishingUser.publishingUserName
      ? this._translateService.instant(PortalResources.userCredsDesc).format(`${publishingUser.publishingUserName}`)
      : this._translateService.instant(PortalResources.userCredsNewUserDesc);

    this.userPasswordForm.reset({ userName: publishingUser.publishingUserName, password: '', passwordConfirm: '' });
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

  private _setupUserPasswordForm() {
    const requiredValidation = new RequiredValidator(this._translateService, true);

    //The password should be at least eight characters long and must contain letters and numbers.
    const passwordMinimumRequirementsRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    //The specified password does not meet the minimum requirements.
    const passwordValidator = RegexValidator.create(
      passwordMinimumRequirementsRegex,
      this._translateService.instant(PortalResources.userCredsError)
    );

    this.userPasswordForm = this._fb.group({
      userName: ['', [requiredValidation]],
      password: ['', [requiredValidation, passwordValidator]],
      passwordConfirm: [''],
    });
    this.userPasswordForm
      .get('passwordConfirm')
      .setValidators([ConfirmPasswordValidator.create(this._translateService, this.userPasswordForm.get('password'))]);

    this.userPasswordForm
      .get('password')
      .valueChanges.takeUntil(this._ngUnsubscribe$)
      .subscribe(val => {
        this.userPasswordForm.get('passwordConfirm').updateValueAndValidity();
      });
  }

  private _setupResetPublishProfileEvent() {
    let resetPublishingProfileNotificationId = '';
    this._resetPublishingProfile$
      .takeUntil(this._ngUnsubscribe$)
      .do(() => (this.resetting = true))
      .switchMap(() =>
        this._portalService.startNotification(
          this._translateService.instant(PortalResources.resettingCredentials),
          this._translateService.instant(PortalResources.resettingCredentials)
        )
      )
      .switchMap(notificationInfo => {
        resetPublishingProfileNotificationId = notificationInfo.id;
        return this._siteService.resetPublishProfile(this._credentialsData.resourceId).catch((error, result) => {
          const errorMessage = error && error.json && error.json().Message;
          this._portalService.stopNotification(
            resetPublishingProfileNotificationId,
            false,
            errorMessage || PortalResources.resettingCredentialsFail
          );
          return Observable.of(null);
        });
      })
      .subscribe(result => {
        this.resetting = false;
        this.setInput({
          resourceId: this._credentialsData.resourceId,
        });
        if (result) {
          this._portalService.stopNotification(
            resetPublishingProfileNotificationId,
            true,
            this._translateService.instant(PortalResources.resettingCredentialsSuccess)
          );
        }
      });
  }

  private _setupSaveCredentialsEvent() {
    let saveUserCredentialsNotificationId = '';
    this._saveUserCredentials$
      .takeUntil(this._ngUnsubscribe$)
      .do(() => (this.saving = true))
      .switchMap(() =>
        this._portalService
          .startNotification(
            this._translateService.instant(PortalResources.savingCredentials),
            this._translateService.instant(PortalResources.savingCredentials)
          )
          .take(1)
      )
      .switchMap(notificationInfo => {
        saveUserCredentialsNotificationId = notificationInfo.id;
        return this._siteService.updatePublishingUser({
          publishingUserName: this.userPasswordForm.value.userName,
          publishingPassword: this.userPasswordForm.value.password,
        });
      })
      .subscribe(result => {
        this.saving = false;

        if (result.isSuccessful) {
          this._portalService.stopNotification(
            saveUserCredentialsNotificationId,
            true,
            this._translateService.instant(PortalResources.savingCredentialsSuccess)
          );

          this.setInput({
            resourceId: this._credentialsData.resourceId,
          });
        } else {
          const message = (result.error && result.error.message) || this._translateService.instant(PortalResources.savingCredentialsFail);
          this._portalService.stopNotification(saveUserCredentialsNotificationId, false, message);
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

  private _setupEndpoints(ftpProfile: PublishingProfile, publishingCredentials: PublishingCredentials, siteName: string) {
    const scmUri = publishingCredentials.scmUri.split('@')[1];

    this.gitEndpoint = `https://${scmUri}:443/${siteName}.git`;
    this.ftpsEndpoint = ftpProfile.publishUrl.replace('ftp:/', 'ftps:/');
  }
}
