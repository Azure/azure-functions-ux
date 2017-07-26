import { Component, Input } from '@angular/core';
import { EventGridInput} from '../shared/models/binding-input';
import { PortalService } from '../shared/services/portal.service';

@Component({
  selector: 'binding-event-grid',
  templateUrl: './binding-event-grid.component.html',
  styleUrls: ['./binding-event-grid.component.scss','./../binding-input/binding-input.component.css']
})
export class BindingEventGridComponent {

  value: string;

  constructor(private _portalService: PortalService) { }

  @Input() set input(input: EventGridInput) {
      this.value = input.value;
  }

  openSubscribeBlade() {
      debugger;
  }

  openManageBlade() {
      debugger;
  }
}
