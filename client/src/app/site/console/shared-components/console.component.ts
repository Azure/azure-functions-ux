import { FeatureComponent } from '../../../shared/components/feature-component';
import { SiteData, TreeViewInfo } from '../../../tree-view/models/tree-view-info';
import { Subject } from 'rxjs/Subject';
import { SelectOption } from '../../../shared/models/select-option';
import { LogCategories } from '../../../shared/models/constants';
import { SiteService } from '../../../shared/services/site.service';
import { LogService } from '../../../shared/services/log.service';
import { CacheService } from '../../../shared/services/cache.service';
import { ConsoleService } from './../services/console.service';
import { Injector, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BusyStateName } from '../../../busy-state/busy-state.component';

export abstract class ConsoleComponent extends FeatureComponent<TreeViewInfo<SiteData>> {
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
        private _siteService: SiteService,
        private _logService: LogService,
        private _cacheService: CacheService,
        private _consoleService: ConsoleService,
        console: BusyStateName,
        injector: Injector
        ) {
          super('site-console', injector, console);
          this.featureName = 'console';
          this.isParentComponent = true;
          this.initialized = true;
          this.optionsChange = new Subject<number>();
          this.optionsChange.subscribe((option) => {
              this.currentOption = option;
              this.onOptionChange();
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
                 this.appName = r.publishingCredentials.name;
                 this.clearBusyEarly();
               },
               err => {
                 this._logService.error(LogCategories.cicd, '/load-linux-console', err);
                 this.clearBusyEarly();
               });
         }

         protected abstract onOptionChange();
}
