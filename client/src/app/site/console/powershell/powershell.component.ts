import { Component, ComponentFactoryResolver } from '@angular/core';
import { ConsoleService, ConsoleTypes } from './../shared/services/console.service';
import { AbstractWindowsComponent } from '../shared/components/abstract.windows.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-powershell',
  templateUrl: '././../shared/templates/abstract.console.component.html',
  styleUrls: ['./../console.component.scss', './powershell.component.scss'],
  providers: [],
})
export class PowershellComponent extends AbstractWindowsComponent {
  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    public consoleService: ConsoleService,
    translateService: TranslateService
  ) {
    super(componentFactoryResolver, consoleService, translateService);
    this.consoleType = ConsoleTypes.PS;
  }

  protected getTabKeyCommand(): string {
    return 'Get-ChildItem -name';
  }

  protected getCommandPrefix(): string {
    return 'powershell ';
  }

  /**
   * Get the left-hand-side text for the console
   */
  protected getConsoleLeft() {
    return `PS ${this.dir}>`;
  }
}
