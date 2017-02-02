/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GlobalStateService } from './global-state.service';

describe('Service: GlobalState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlobalStateService]
    });
  });

  it('should ...', inject([GlobalStateService], (service: GlobalStateService) => {
    expect(service).toBeTruthy();
  }));
});
