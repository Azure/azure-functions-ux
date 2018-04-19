import { AppModule } from './../../app.module';
/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FunctionsService } from './functions.service';

describe('Service: Functions', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition);
  });

  it('should ...', inject([FunctionsService], (service: FunctionsService) => {
    expect(service).toBeTruthy();
  }));
});
