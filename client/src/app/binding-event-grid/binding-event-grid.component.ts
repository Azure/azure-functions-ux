import { Component, Input } from '@angular/core';
import { EventGridInput } from '../shared/models/binding-input';
import { PortalService } from '../shared/services/portal.service';

@Component({
  selector: 'binding-event-grid',
  templateUrl: './binding-event-grid.component.html',
  styleUrls: ['./binding-event-grid.component.scss', './../binding-input/binding-input.component.css'],
})
export class BindingEventGridComponent {
  @Input()
  input: EventGridInput;

  constructor(private _portalService: PortalService) {}

  openSubscribeBlade() {
    this._portalService.openBladeDeprecated(
      {
        detailBlade: 'CreateEventSubscriptionBlade',
        extension: 'Microsoft_Azure_EventGrid',
        detailBladeInputs: {
          inputs: {
            subscriberEndpointUrl: this.input.value,
            labels: ['functions', this.input.bladeLabel],
          },
        },
      },
      'event-grid-binding'
    );
  }

  openManageBlade() {
    this._portalService.openBladeDeprecated(
      {
        detailBlade: 'ListEventSubscriptionsFromSubscriberBlade',
        extension: 'Microsoft_Azure_EventGrid',
        detailBladeInputs: {
          inputs: {
            endpointType: 'AzureFunction',
            labels: ['functions', this.input.bladeLabel],
            endpointResourceId: this.input.id,
          },
        },
      },
      'event-grid-binding'
    );
  }
}
