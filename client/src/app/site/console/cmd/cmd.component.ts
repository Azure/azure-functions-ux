import { Component, ComponentFactoryResolver } from '@angular/core';
import { ConsoleService, ConsoleTypes } from './../shared/services/console.service';
import { AbstractWindowsComponent } from '../shared/components/abstract.windows.component';
import { TranslateService } from '@ngx-translate/core';
import { PortalService } from '../../../shared/services/portal.service';

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
    portalService: PortalService
  ) {
    super(componentFactoryResolver, consoleService, translateService, portalService);
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
