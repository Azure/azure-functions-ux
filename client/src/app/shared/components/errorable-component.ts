import { ErrorEvent } from 'app/shared/models/error-event';
import { BroadcastService } from './../services/broadcast.service';
import { BroadcastEvent } from '../models/broadcast-event';

export abstract class ErrorableComponent {
  constructor(protected componentName: string, protected _broadcastService: BroadcastService) {}

  showComponentError(error: ErrorEvent) {
    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, error);
  }

  clearComponentError(error: ErrorEvent) {}

  clearComponentErrors() {}
}
