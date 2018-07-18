import { Injector, Input, Component } from '@angular/core';
import { FeatureComponent } from '../../shared/components/feature-component';
import { SiteData, TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { Subject } from 'rxjs/Subject';
import { SelectOption } from '../../shared/models/select-option';
import { LogCategories, SiteTabIds } from '../../shared/models/constants';
import { SiteService } from '../../shared/services/site.service';
import { LogService } from '../../shared/services/log.service';
import { CacheService } from '../../shared/services/cache.service';
import { ConsoleService, ConsoleTypes } from './shared/services/console.service';
import { Observable } from 'rxjs/Observable';
import { ArmUtil } from '../../shared/Utilities/arm-utils';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { fade } from './shared/animations/fade.animation';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { PublishingCredentials } from '../../shared/models/publishing-credentials';
import { Site } from '../../shared/models/arm/site';
import { errorIds } from '../../shared/models/error-ids';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss'],
  animations: [
    fade
  ]
})
export class ConsoleComponent extends FeatureComponent<TreeViewInfo<SiteData>> {
    public toggleConsole = true;
    public consoleIcon = 'image/console.svg';
    public resourceId: string;
    public initialized = false;
    public windows = true;
    public appName: string;
    public viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
    public currentOption: number;
    public options: SelectOption<number>[];
    public optionsChange: Subject<number>;

    @Input() set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
        this.setInput(viewInfo);
      }
      constructor(
        private _translateService: TranslateService,
        private _siteService: SiteService,
        private _logService: LogService,
        private _cacheService: CacheService,
        private _consoleService: ConsoleService,
        injector: Injector
        ) {
          super('site-console', injector, SiteTabIds.console);
          this.featureName = 'console';
          this.isParentComponent = true;
          this.initialized = true;
          this.optionsChange = new Subject<number>();
          this.optionsChange.subscribe((option) => {
              this.currentOption = option;
              this._onOptionChange();
            });
          this.currentOption = ConsoleTypes.CMD;
        }

      protected setup(inputEvents: Observable<TreeViewInfo<SiteData>>) {
          // ARM API request to get the site details and the publishing credentials
          return inputEvents
            .distinctUntilChanged()
            .switchMap(view => {
              this.setBusy();
              this.resourceId = view.resourceId;
              this._consoleService.sendResourceId(this.resourceId);
              return Observable.zip(
                this._siteService.getSite(this.resourceId),
                this._cacheService.postArm(`${this.resourceId}/config/publishingcredentials/list`),
                (site, publishingCredentials) => ({
                  site: site.result,
                  publishingCredentials: publishingCredentials.json()
                })
              );
            })
            .do(
              r => {
                this._consoleService.sendSite(r.site);
                this._consoleService.sendPublishingCredentials(r.publishingCredentials);
                this.appName = r.publishingCredentials.name;
                if (ArmUtil.isLinuxApp(r.site)) {
                  // linux-app
                  this._setLinuxDashboard();
                }else {
                  this._setWindowsDashboard();
                }
                this.clearBusyEarly();
                if (!this._siteDetailAvailable(r.site, r.publishingCredentials)) {
                  this.showComponentError({
                    message: this._translateService.instant(PortalResources.error_consoleNotAvailable),
                    errorId: errorIds.unknown,
                    resourceId: this.resourceId
                  });
                  this.setBusy();
                  return;
                }
              },
              err => {
                this._logService.error(LogCategories.cicd, '/load-linux-console', err);
                this.clearBusyEarly();
              });
      }

      private _siteDetailAvailable(site: ArmObj<Site>, publishingCredentials: ArmObj<PublishingCredentials>): boolean {
        if (!site || !site.properties.hostNameSslStates.find (h => h.hostType === 1) || !publishingCredentials ||
        publishingCredentials.properties.publishingPassword === '' || publishingCredentials.properties.publishingUserName === '') {
          return false;
        }
        return true;
      }

      private _setWindowsDashboard() {
          this.windows = true;
          this.options = [
            {
              displayLabel: this._translateService.instant(PortalResources.feature_cmdConsoleName),
              value: ConsoleTypes.CMD
            },
            {
              displayLabel: this._translateService.instant(PortalResources.feature_powerShellConsoleName),
              value: ConsoleTypes.PS
            }
          ];
          this.currentOption = ConsoleTypes.CMD;
        }

      private _setLinuxDashboard() {
          this.windows = false;
          this.options = [
            {
              displayLabel: this._translateService.instant(PortalResources.feature_bashConsoleName),
              value: ConsoleTypes.BASH
            },
            {
              displayLabel: this._translateService.instant(PortalResources.feature_sshConsoleName),
              value: ConsoleTypes.SSH
            }
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
