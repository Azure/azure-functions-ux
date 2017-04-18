import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotNewComponent } from './slot-new.component';

describe('SlotNewComponent', () => {
  let component: SlotNewComponent;
  let fixture: ComponentFixture<SlotNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlotNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlotNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
