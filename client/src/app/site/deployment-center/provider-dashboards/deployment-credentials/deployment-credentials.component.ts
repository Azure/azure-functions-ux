import { Component, OnInit, Input, Injector, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CacheService } from '../../../../shared/services/cache.service';
import { PublishingProfile } from '../../Models/publishing-profile';
import { from } from 'rxjs/observable/from';
import { Subject } from 'rxjs/Subject';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BroadcastService } from '../../../../shared/services/broadcast.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { RequiredValidator } from '../../../../shared/validators/requiredValidator';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmPasswordValidator } from '../../../../shared/validators/passwordValidator';
import { FeatureComponent } from '../../../../shared/components/feature-component';
import { Observable } from 'rxjs/Observable';
import { SiteService } from '../../../../shared/services/site.service';
import { KeyCodes, Links } from '../../../../shared/models/constants';
import { Dom } from '../../../../shared/Utilities/dom';
import { PortalService } from 'app/shared/services/portal.service';
import { PortalResources } from 'app/shared/models/portal-resources';
import { of } from 'rxjs/observable/of';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { RegexValidator } from 'app/shared/validators/regexValidator';

@Component({
  selector: 'app-deployment-credentials',
  templateUrl: './deployment-credentials.component.html',
  styleUrls: ['./deployment-credentials.component.scss', '../../deployment-center-setup/deployment-center-setup.component.scss'],
})
export class DeploymentCredentialsComponent extends FeatureComponent<string> implements OnInit, OnDestroy {
  @ViewChild('credsTabs')
  groupElements: ElementRef;

  @Input()
  resourceId: string;
  @Input()
  standalone = true;

  @Input()
  localGit = false;

  activeTab: 'user' | 'app' = 'app';

  public appUserName: string;
  public appPwd: string;

  public userPasswordForm: FormGroup;
  private _resetPublishingProfile$ = new Subject();
  private _saveUserCredentials$ = new Subject();

  private _ngUnsubscribe$ = new Subject();
  private _currentTabIndex: number;
  public saving = false;
  public resetting = false;
  public userCredsDesc = '';
  public learnMoreLink = Links.deploymentCredentialsLearnMore;
  constructor(
    private _cacheService: CacheService,
    private _siteService: SiteService,
    private _portalService: PortalService,
    private _translateService: TranslateService,
    fb: FormBuilder,
    broadcastService: BroadcastService,
    injector: Injector
  ) {
    super('DeploymentCredentialsComponent', injector);
    const requiredValidation = new RequiredValidator(this._translateService, true);
    const passwordValidator = RegexValidator.create(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, //The specified password does not meet the minimum requirements. The password should be at least eight characters long and must contain letters, numbers, and symbols.
      this._translateService.instant(PortalResources.userCredsError)
    );
    this.userPasswordForm = fb.group({
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

  protected setup(inputEvents: Observable<string>) {
    return inputEvents.switchMap(() => {
      const publishXml$ = this._siteService
        .getPublishingProfile(this.resourceId)
        .switchMap(r => from(PublishingProfile.parsePublishProfileXml(r.result)))
        .filter(x => x.publishMethod === 'FTP')
        .do(ftpProfile => {
          if (this.localGit) {
            this.appUserName = ftpProfile.userName.split('\\')[1];
          } else {
            this.appUserName = ftpProfile.userName;
          }

          this.appPwd = ftpProfile.userPWD;
        });

      const publishingUsers$ = this._siteService.getPublishingUser().do(r => {
        const creds = r.result;
        const siteDescriptor = new ArmSiteDescriptor(this.resourceId);
        let siteName = siteDescriptor.site;
        const slotName = siteDescriptor.slot;

        if (slotName) {
          siteName = `${siteName}__${slotName}`;
        }
        const putInAs = this.localGit ? creds.properties.publishingUserName : `${siteName}\\${creds.properties.publishingUserName}`;
        this.userCredsDesc = creds.properties.publishingUserName
          ? this._translateService.instant(PortalResources.userCredsDesc).format(`${putInAs}`)
          : this._translateService.instant(PortalResources.userCredsNewUserDesc);
        this.userPasswordForm.reset({ userName: creds.properties.publishingUserName, password: '', passwordConfirm: '' });
      });
      return forkJoin(publishXml$, publishingUsers$);
    });
  }

  ngOnInit() {
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
        return this._cacheService.postArm(`${this.resourceId}/newpassword`, true).catch((error, result) => {
          const errorMessage = error && error.json && error.json().Message;
          this._portalService.stopNotification(
            resetPublishingProfileNotificationId,
            false,
            errorMessage || PortalResources.resettingCredentialsFail
          );
          return of(null);
        });
      })
      .subscribe(result => {
        this.resetting = false;
        this.setInput(this.resourceId);
        if (result) {
          this._portalService.stopNotification(
            resetPublishingProfileNotificationId,
            true,
            this._translateService.instant(PortalResources.resettingCredentialsSuccess)
          );
        }
      });

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
        return this._cacheService
          .putArm(`/providers/Microsoft.Web/publishingUsers/web`, null, {
            properties: {
              publishingUserName: this.userPasswordForm.value.userName,
              publishingPassword: this.userPasswordForm.value.password,
            },
          })
          .catch((error, result) => {
            const errorMessage = error && error.json && error.json().Message;
            this._portalService.stopNotification(
              saveUserCredentialsNotificationId,
              false,
              errorMessage || PortalResources.savingCredentialsFail
            );
            return of(null);
          });
      })
      .subscribe(result => {
        this.saving = false;
        this.setInput(this.resourceId);
        if (result) {
          this._portalService.stopNotification(
            saveUserCredentialsNotificationId,
            true,
            this._translateService.instant(PortalResources.savingCredentialsSuccess)
          );
        }
      });
    this.setInput(this.resourceId);
  }

  ngOnDestroy() {
    this._ngUnsubscribe$.next();
    super.ngOnDestroy();
  }
  selectTab(tab) {
    this.activeTab = tab;
    this._currentTabIndex = 'app' ? 0 : 1;
  }
  _getTabElements() {
    return this.groupElements.nativeElement.children;
  }

  _clearFocusOnTab(elements: HTMLCollection, index: number) {
    const oldFeature = Dom.getTabbableControl(<HTMLElement>elements[index]);
    Dom.clearFocus(oldFeature);
  }

  _setFocusOnTab(elements: HTMLCollection, index: number) {
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

  onKeyPress(event: KeyboardEvent, info: 'app' | 'user') {
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
  public resetPublishingProfile = () => this._resetPublishingProfile$.next();
  public saveUserCredentails = () => this._saveUserCredentials$.next();
}
