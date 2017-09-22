import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IbizaFeatureComponent } from './ibiza-feature.component';

describe('IbizaFeatureComponent', () => {
  let component: IbizaFeatureComponent;
  let fixture: ComponentFixture<IbizaFeatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IbizaFeatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IbizaFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
