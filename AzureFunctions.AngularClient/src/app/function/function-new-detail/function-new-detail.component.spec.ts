import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionNewDetailComponent } from './function-new-detail.component';

describe('FunctionNewDetailComponent', () => {
  let component: FunctionNewDetailComponent;
  let fixture: ComponentFixture<FunctionNewDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FunctionNewDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionNewDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
