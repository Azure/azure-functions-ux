import { AppModule } from './../../app.module';
/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TryFunctionsService } from './try-functions.service';

describe('Service: Functions', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition);
  });

  it('should ...', inject([TryFunctionsService], (service: TryFunctionsService) => {
    expect(service).toBeTruthy();
  }));
});
