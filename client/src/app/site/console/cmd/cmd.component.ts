import { Component, ComponentFactoryResolver} from '@angular/core';
import { ConsoleService, ConsoleTypes } from './../services/console.service';
import { WindowsComponent } from '../shared-components/windows.component';

@Component({
  selector: 'app-cmd',
  templateUrl: './cmd.component.html',
  styleUrls: ['./../console.component.scss']
})
export class CmdComponent extends WindowsComponent {

  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    public consoleService: ConsoleService
    ) {
      super(componentFactoryResolver, consoleService);
      this.consoleType = ConsoleTypes.CMD;
    }

  protected getTabKeyCommand(): string {
    return 'dir /b /a';
  }

  protected getCommandPrefix(): string {
    return '';
  }

}
