import { Component, Input, Injector } from '@angular/core';
import { FeatureComponent } from '../../shared/components/feature-component';
import { TreeViewInfo, SiteData } from '../../tree-view/models/tree-view-info';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { SiteTabIds, LogCategories } from '../../shared/models/constants';
import { CacheService } from '../../shared/services/cache.service';
import { LogService } from '../../shared/services/log.service';
import { SiteService } from '../../shared/services/site.service';
import { ConsoleService } from './services/console.service';
import { SelectOption } from '../../shared/models/select-option';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';

enum OptionsTypes{
  BASH = 'BASH',
  SSH = 'SSH'
}

@Component({
    selector: 'app-linux',
    templateUrl: './console.component.html',
    styleUrls: ['./console.component.scss'],
})
export class LinuxConsoleComponent extends FeatureComponent<TreeViewInfo<SiteData>> {
  public toggleConsole = true;
  public consoleIcon = 'image/console.svg';
  public resourceId: string;
  public initialized = false;
  public linux = true;
  public windows = false;
  public viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
  public currentOption: string;
  public options: SelectOption<string>[];
  public optionsChange: Subject<string>;
  @Input() set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
    this.setInput(viewInfo);
  }

  constructor(
    private _siteService: SiteService,
    private _translateService: TranslateService,
    private _logService: LogService,
    private _cacheService: CacheService,
    private _consoleService: ConsoleService,
    injector: Injector,
    ) {
      super('site-console', injector, SiteTabIds.winConsole);
      this.featureName = 'console';
      this.isParentComponent = true;
      this.initialized = true;
      this.options = [
        {
          displayLabel: this._translateService.instant(PortalResources.feature_bashConsoleName),
          value: OptionsTypes.BASH
        },
        {
          displayLabel: this._translateService.instant(PortalResources.feature_sshConsoleName),
          value: OptionsTypes.SSH
        }
      ];
      this.currentOption = OptionsTypes.BASH;
      this.optionsChange = new Subject<string>();
      this.optionsChange.subscribe((option) => {
        this.currentOption = option;
        this._onOptionChange();
      });
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
           this.clearBusyEarly();
         },
         err => {
           this._logService.error(LogCategories.cicd, '/load-linux-console', err);
           this.clearBusyEarly();
         });
   }

   /**
    * Radio-option changed
    */
   private _onOptionChange(){
     if (this.currentOption === OptionsTypes.BASH) {
       this.toggleConsole = true;
       return;
     }
     this.toggleConsole = false;
   }
}
