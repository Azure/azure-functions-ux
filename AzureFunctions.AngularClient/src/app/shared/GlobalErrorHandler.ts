import { ErrorHandler, Injectable } from '@angular/core';

import { AiService } from './services/ai.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(private _aiService: AiService) {
  }

  handleError(error) {
    this._aiService.trackException(error, '/errors/unhandled');
    console.error(error);
  }
}
