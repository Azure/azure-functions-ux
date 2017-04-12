import { AiService } from './services/ai.service';
import { ErrorHandler, Injectable } from "@angular/core";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(private _aiService : AiService){
  }
  
  handleError(error) {
    this._aiService.trackException(error, '/errors/unhandled');
    console.error(error);
  }
}