import { AppModule } from './../../app.module';
/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { UserService } from './user.service';

describe('Service: User', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition);
  });

  it('should ...', inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));
});
