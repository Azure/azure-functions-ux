import { AppModule } from './../../app.module';
/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BroadcastService } from './broadcast.service';

describe('Service: Broadcast', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition);
  });

  it('should ...', inject([BroadcastService], (service: BroadcastService) => {
    expect(service).toBeTruthy();
  }));
});
