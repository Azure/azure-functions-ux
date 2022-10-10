import { Component, ComponentFactoryResolver } from '@angular/core';
import { ConsoleService, ConsoleTypes } from './../shared/services/console.service';
import { AbstractWindowsComponent } from '../shared/components/abstract.windows.component';
import { TranslateService } from '@ngx-translate/core';
import { PortalService } from '../../../shared/services/portal.service';
import { NoCorsHttpService } from '../../../shared/no-cors-http-service';

@Component({
  selector: 'app-cmd',
  templateUrl: '././../shared/templates/abstract.console.component.html',
  styleUrls: ['./../console.component.scss'],
})
export class CmdComponent extends AbstractWindowsComponent {
  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    public consoleService: ConsoleService,
    translateService: TranslateService,
    portalService: PortalService,
    noCorsHttpService: NoCorsHttpService
  ) {
    super(componentFactoryResolver, consoleService, translateService, portalService, noCorsHttpService);
    this.consoleType = ConsoleTypes.CMD;
  }

  protected getTabKeyCommand(): string {
    return 'dir /b /a';
  }

  protected getCommandPrefix(): string {
    return '';
  }

  /**
   * Get the left-hand-side text for the console
   */
  protected getConsoleLeft() {
    return `${this.dir}>`;
  }
}
