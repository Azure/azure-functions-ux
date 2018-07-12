import { Component, Injector } from '@angular/core';
import { SiteTabIds } from '../../shared/models/constants';
import { CacheService } from '../../shared/services/cache.service';
import { LogService } from '../../shared/services/log.service';
import { SiteService } from '../../shared/services/site.service';
import { ConsoleService, ConsoleTypes } from './services/console.service';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { ConsoleComponent } from './shared-components/console.component';

@Component({
    selector: 'app-windows',
    templateUrl: './console.component.html',
    styleUrls: ['./console.component.scss'],
})
export class WindowsConsoleComponent extends ConsoleComponent {
  constructor(
    private _translateService: TranslateService,
    siteService: SiteService,
    logService: LogService,
    cacheService: CacheService,
    consoleService: ConsoleService,
    injector: Injector,
    ) {
      super(siteService, logService, cacheService, consoleService, SiteTabIds.winConsole , injector);
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

   /**
    * Radio-option changed
    */
   protected onOptionChange() {
     if (this.currentOption === ConsoleTypes.CMD) {
       this.toggleConsole = true;
       return;
     }
     this.toggleConsole = false;
   }
}
