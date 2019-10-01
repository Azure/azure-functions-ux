import { Injector, Input, Component, ViewChild } from '@angular/core';
import { FeatureComponent } from '../../shared/components/feature-component';
import { SiteData, TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { Subject } from 'rxjs/Subject';
import { SelectOption } from '../../shared/models/select-option';
import { SiteTabIds } from '../../shared/models/constants';
import { SiteService } from '../../shared/services/site.service';
import { ConsoleService, ConsoleTypes } from './shared/services/console.service';
import { Observable } from 'rxjs/Observable';
import { ArmUtil } from '../../shared/Utilities/arm-utils';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { fade } from './shared/animations/fade.animation';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { PublishingCredentials } from '../../shared/models/publishing-credentials';
import { Site, HostType } from '../../shared/models/arm/site';
import { errorIds } from '../../shared/models/error-ids';
import { FunctionAppContext } from '../../shared/function-app-context';
import { EditModeWarningComponent } from '../../edit-mode-warning/edit-mode-warning.component';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss'],
  animations: [fade],
})
export class ConsoleComponent extends FeatureComponent<TreeViewInfo<SiteData>> {
  @Input()
  consoleType: 'tab' | 'blade' = 'tab';
  public toggleConsole = true;
  public consoleIcon = 'image/console.svg';
  public resourceId: string;
  public initialized = false;
  public os: 'windows' | 'linux' = null;
  public appName: string;
  public viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
  public currentOption = -1;
  public options: SelectOption<number>[];
  public optionsChange: Subject<number>;
  public sshUrl = '';
  public appModeVisible = false;
  public context: FunctionAppContext;
  public loadFailureMessage = '';

  private _injector: Injector;

  @ViewChild('ssh')
  private _sshComponent;

  @ViewChild(EditModeWarningComponent)
  editModeWarning: EditModeWarningComponent;

  @Input()
  set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
    this.setInput(viewInfo);
  }

  constructor(
    private _translateService: TranslateService,
    private _siteService: SiteService,
    private _consoleService: ConsoleService,
    injector: Injector
  ) {
    super('site-console', injector, SiteTabIds.console);
    this._injector = injector;
    this.featureName = 'console';
    this.isParentComponent = true;
    this.initialized = true;
    this.optionsChange = new Subject<number>();
    this.optionsChange.subscribe(option => {
      this.currentOption = option;
      this._onOptionChange();
    });
  }

  reconnectSSH() {
    this._sshComponent.reconnect();
  }

  openNewSSHWindow() {
    window.open(this._sshComponent.getKuduUri(), '_blank');
  }

  protected setup(inputEvents: Observable<TreeViewInfo<SiteData>>) {
    // ARM API request to get the site details and the publishing credentials
    return inputEvents
      .distinctUntilChanged()
      .switchMap(view => {
        this.os = null;
        this.appModeVisible = false;
        this.resourceId = view.resourceId;
        this.loadFailureMessage = '';
        this._consoleService.sendResourceId(this.resourceId);
        return Observable.zip(this._siteService.getSite(this.resourceId), this._siteService.getPublishingCredentials(this.resourceId));
      })
      .do(r => {
        const [siteResponse, publishingCredentialsResponse] = r;
        if (siteResponse.isSuccessful && publishingCredentialsResponse.isSuccessful) {
          this._consoleService.sendSite(siteResponse.result);
          this._consoleService.sendPublishingCredentials(publishingCredentialsResponse.result);
          this.appName = publishingCredentialsResponse.result.name;
          this.context = ArmUtil.mapArmSiteToContext(siteResponse.result, this._injector);
          this.os = ArmUtil.isLinuxApp(siteResponse.result) ? 'linux' : 'windows';
          this.appModeVisible = ArmUtil.isFunctionApp(siteResponse.result);
          if (ArmUtil.isLinuxApp(siteResponse.result)) {
            // linux-app
            this._setLinuxDashboard();
          } else {
            this._setWindowsDashboard();
          }
          this.clearBusyEarly();
          if (!this._siteDetailAvailable(siteResponse.result, publishingCredentialsResponse.result)) {
            this.loadFailureMessage = this._translateService.instant(PortalResources.error_consoleNotAvailable);
            this.showComponentError({
              message: this._translateService.instant(PortalResources.error_consoleNotAvailable),
              errorId: errorIds.unknown,
              resourceId: this.resourceId,
            });
            this.setBusy();
            return;
          }
        } else {
          let [noAccess, hasReadOnlyLock, errorMessage] = [false, false, ''];

          [siteResponse, publishingCredentialsResponse].forEach(response => {
            if (response.error) {
              noAccess = noAccess || response.error.errorId === errorIds.armErrors.noAccess;
              hasReadOnlyLock = hasReadOnlyLock || response.error.errorId === errorIds.armErrors.scopeLocked;
              if (response.error.message) {
                errorMessage = errorMessage + response.error.message + '\r\n';
              }
            }
          });

          if (noAccess) {
            this.loadFailureMessage = this._translateService.instant(PortalResources.featureRequiresWritePermissionOnApp);
          } else if (hasReadOnlyLock) {
            this.loadFailureMessage = this._translateService.instant(PortalResources.featureDisabledReadOnlyLockOnApp);
          } else {
            this.loadFailureMessage = !errorMessage
              ? this._translateService.instant(PortalResources.error_consoleNotAvailable)
              : this._translateService.instant(PortalResources.error_consoleNotAvailable) + '\r\n' + errorMessage;
          }

          this.clearBusyEarly();
        }
      });
  }

  private _siteDetailAvailable(site: ArmObj<Site>, publishingCredentials: ArmObj<PublishingCredentials>): boolean {
    if (
      !site ||
      !site.properties.hostNameSslStates.find(h => h.hostType === HostType.Repository) ||
      !publishingCredentials ||
      publishingCredentials.properties.publishingPassword === '' ||
      publishingCredentials.properties.publishingUserName === ''
    ) {
      return false;
    }
    return true;
  }

  private _setWindowsDashboard() {
    this.os = 'windows';
    this.options = [
      {
        displayLabel: this._translateService.instant(PortalResources.feature_cmdConsoleName),
        value: ConsoleTypes.CMD,
      },
      {
        displayLabel: this._translateService.instant(PortalResources.feature_powerShellConsoleName),
        value: ConsoleTypes.PS,
      },
    ];
    this.currentOption = ConsoleTypes.CMD;
  }

  private _setLinuxDashboard() {
    this.os = 'linux';
    this.options = [
      {
        displayLabel: this._translateService.instant(PortalResources.feature_bashConsoleName),
        value: ConsoleTypes.BASH,
      },
      {
        displayLabel: this._translateService.instant(PortalResources.feature_sshConsoleName),
        value: ConsoleTypes.SSH,
      },
    ];
    this.currentOption = ConsoleTypes.BASH;
  }

  private _onOptionChange() {
    if (this.currentOption === ConsoleTypes.CMD || this.currentOption === ConsoleTypes.BASH) {
      this.toggleConsole = true;
      return;
    }
    this.toggleConsole = false;
  }
}
