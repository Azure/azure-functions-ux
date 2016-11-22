/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ArmService } from './arm.service';

describe('Service: Arm', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ArmService]
    });
  });

  it('should ...', inject([ArmService], (service: ArmService) => {
    expect(service).toBeTruthy();
  }));
});
