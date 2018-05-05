import { Component, OnInit, Input } from '@angular/core';
import { CacheService } from '../../../../shared/services/cache.service';
import { PublishingProfile } from '../../Models/publishing-profile';
import { from } from 'rxjs/observable/from';
import { Subject } from 'rxjs/Subject';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BusyStateScopeManager } from '../../../../busy-state/busy-state-scope-manager';
import { BroadcastService } from '../../../../shared/services/broadcast.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { RequiredValidator } from '../../../../shared/validators/requiredValidator';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmPasswordValidator } from '../../../../shared/validators/passwordValidator';

@Component({
  selector: 'app-deployment-credentials',
  templateUrl: './deployment-credentials.component.html',
  styleUrls: ['./deployment-credentials.component.scss', '../../deployment-center-setup/deployment-center-setup.component.scss']
})
export class DeploymentCredentialsComponent implements OnInit {
  @Input() resourceId: string;
  activeTab: 'user' | 'app' = 'user';

  public appUserName: string;
  public appPwd: string;

  private _busyManager: BusyStateScopeManager;
  public userPasswordForm: FormGroup;
  private _refresh$ = new Subject();
  private _resetPublishingProfile$ = new Subject();
  private _saveUserCredentials$ = new Subject();

  constructor(private _cacheService: CacheService, fb: FormBuilder, broadcastService: BroadcastService, translateService: TranslateService) {
    this._busyManager = new BusyStateScopeManager(broadcastService, 'deployment-credentials');
    const requiredValidation = new RequiredValidator(translateService, true);
    this.userPasswordForm = fb.group({
      userName: ['', [requiredValidation]],
      password: ['', [requiredValidation]],
      passwordConfirm: ['']
    });
    this.userPasswordForm.get('passwordConfirm').setValidators(ConfirmPasswordValidator.create(translateService, this.userPasswordForm.get('password')));
  }

  ngOnInit() {

    const publishXml$ = this._cacheService.postArm(`${this.resourceId}/publishxml`, true)
      .switchMap(r => from(PublishingProfile.parsePublishProfileXml(r.text())))
      .filter(x => x.publishMethod === 'FTP')
      .do(ftpProfile => {
        this.appUserName = ftpProfile.userName;
        this.appPwd = ftpProfile.userPWD;
      });

    const publishingUsers$ = this._cacheService.getArm(`/providers/Microsoft.Web/publishingUsers/web`, true)
      .do(r => {
        const creds = r.json();
        this.userPasswordForm.setValue({ userName: creds.properties.publishingUserName, password: '', passwordConfirm: '' });
      });

    this._refresh$
      .do(() => this._busyManager.setBusy())
      .switchMap(() => {
        return forkJoin(publishXml$, publishingUsers$);
      })
      .subscribe(() => {
        this._busyManager.clearBusy();
      });

    this._resetPublishingProfile$
      .do(() => this._busyManager.setBusy())
      .switchMap(() => {
        return this._cacheService.postArm(`${this.resourceId}/newpassword`, true);
      }).subscribe(() => this._refresh$.next());

    this._saveUserCredentials$
      .do(() => this._busyManager.setBusy())
      .switchMap(() => this._cacheService.putArm(`/providers/Microsoft.Web/publishingUsers/web`, null, {
        name: 'web',
        type: 'Microsoft.Web/publishingUsers/web',
        properties: {
          publishingUserName: this.userPasswordForm.value.userName,
          publishingPassword: this.userPasswordForm.value.password
        }
      }))
      .subscribe(() => this._refresh$.next());
    this._refresh$.next();
  }

  selectTab(tab) {
    this.activeTab = tab;
  }

  public resetPublishingProfile = () => this._resetPublishingProfile$.next();
  public saveUserCredentails = () => this._saveUserCredentials$.next();
}
