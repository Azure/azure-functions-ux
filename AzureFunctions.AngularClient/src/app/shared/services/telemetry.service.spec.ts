import { AppModule } from './../../app.module';
/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TelemetryService } from './telemetry.service';

describe('Service: Telemetry', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition);
  });

  it('should ...', inject([TelemetryService], (service: TelemetryService) => {
    expect(service).toBeTruthy();
  }));
});
