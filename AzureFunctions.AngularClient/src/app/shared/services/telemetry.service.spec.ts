/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TelemetryService } from './telemetry.service';

describe('Service: Telemetry', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TelemetryService]
    });
  });

  it('should ...', inject([TelemetryService], (service: TelemetryService) => {
    expect(service).toBeTruthy();
  }));
});
