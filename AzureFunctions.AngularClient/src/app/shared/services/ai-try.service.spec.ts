/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AiTryService } from './ai-try.service';

describe('Service: AiTry', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AiTryService]
    });
  });

  it('should ...', inject([AiTryService], (service: AiTryService) => {
    expect(service).toBeTruthy();
  }));
});
