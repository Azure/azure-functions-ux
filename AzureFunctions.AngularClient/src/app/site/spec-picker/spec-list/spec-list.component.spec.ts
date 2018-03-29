import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecListComponent } from './spec-list.component';

describe('SpecListComponent', () => {
  let component: SpecListComponent;
  let fixture: ComponentFixture<SpecListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
