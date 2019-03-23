import { Injectable } from '@nestjs/common';
import { HomeService } from './home.service.base';
@Injectable()
export class HomeServiceDev extends HomeService {
  constructor() {
    super();
  }

  getAngularFileNames = (version?: string) => {
    // this will cause full version to be loaded
    return null;
  };

  getReactHomeHtml = () => {
    return 'Use https://localhost:44400 . React is not loaded from the server in dev mode.';
  };
}
