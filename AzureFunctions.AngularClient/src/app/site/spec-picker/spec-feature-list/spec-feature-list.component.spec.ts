import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecFeatureListComponent } from './spec-feature-list.component';

describe('SpecFeatureListComponent', () => {
  let component: SpecFeatureListComponent;
  let fixture: ComponentFixture<SpecFeatureListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecFeatureListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecFeatureListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
