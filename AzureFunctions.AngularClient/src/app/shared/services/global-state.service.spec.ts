import { AppModule } from './../../app.module';
/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GlobalStateService } from './global-state.service';

describe('Service: GlobalState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition);
  });

  it('should ...', inject([GlobalStateService], (service: GlobalStateService) => {
    expect(service).toBeTruthy();
  }));
});
