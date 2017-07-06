import { AppModule } from './../../app.module';
/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { UtilitiesService } from './utilities.service';

describe('Service: Utilities', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition);
  });

  it('should ...', inject([UtilitiesService], (service: UtilitiesService) => {
    expect(service).toBeTruthy();
  }));
});
