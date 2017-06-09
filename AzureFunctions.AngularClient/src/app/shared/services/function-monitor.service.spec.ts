import { AppModule } from './../../app.module';
/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FunctionMonitorService } from './function-monitor.service';

describe('Service: FunctionMonitor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition);
  });

  it('should ...', inject([FunctionMonitorService], (service: FunctionMonitorService) => {
    expect(service).toBeTruthy();
  }));
});
