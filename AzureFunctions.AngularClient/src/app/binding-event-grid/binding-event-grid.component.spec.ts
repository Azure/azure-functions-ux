import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BindingEventGridComponent } from './binding-event-grid.component';

describe('BindingEventGridComponent', () => {
  let component: BindingEventGridComponent;
  let fixture: ComponentFixture<BindingEventGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BindingEventGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BindingEventGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
