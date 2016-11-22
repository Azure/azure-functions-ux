/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PortalService } from './portal.service';

describe('Service: Portal', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PortalService]
    });
  });

  it('should ...', inject([PortalService], (service: PortalService) => {
    expect(service).toBeTruthy();
  }));
});
