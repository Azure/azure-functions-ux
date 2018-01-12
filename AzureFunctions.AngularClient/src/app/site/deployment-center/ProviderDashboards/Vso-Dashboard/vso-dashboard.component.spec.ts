import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VsoDashboardComponent } from './vso-dashboard.component';

describe('VsoDashboardComponent', () => {
    let component: VsoDashboardComponent;
    let fixture: ComponentFixture<VsoDashboardComponent>;

    beforeEach(
        async(() => {
            TestBed.configureTestingModule({
                declarations: [VsoDashboardComponent]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(VsoDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
