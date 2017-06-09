import { AppModule } from './../../app.module';
/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ConfigService } from './config.service';

describe('Service: Config', () => {
    beforeEach(() => {
        TestBed.configureTestingModule(AppModule.moduleDefinition);
    });

    it('should ...', inject([ConfigService], (service: ConfigService) => {
        expect(service).toBeTruthy();
    }));
});
