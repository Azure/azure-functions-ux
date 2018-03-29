import { TestBed, inject } from '@angular/core/testing';

import { ApplicationInsightsService } from './application-insights.service';

describe('ApplicationInsightsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApplicationInsightsService]
    });
  });

  it('should be created', inject([ApplicationInsightsService], (service: ApplicationInsightsService) => {
    expect(service).toBeTruthy();
  }));
});
