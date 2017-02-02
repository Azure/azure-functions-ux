/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BackgroundTasksService } from './background-tasks.service';

describe('Service: BackgroundTasks', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BackgroundTasksService]
    });
  });

  it('should ...', inject([BackgroundTasksService], (service: BackgroundTasksService) => {
    expect(service).toBeTruthy();
  }));
});
