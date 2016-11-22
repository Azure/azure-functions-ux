/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FunctionsService } from './functions.service';

describe('Service: Functions', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FunctionsService]
    });
  });

  it('should ...', inject([FunctionsService], (service: FunctionsService) => {
    expect(service).toBeTruthy();
  }));
});
