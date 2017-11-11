import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarPickerComponent } from './sidebar-picker.component';

describe('SidebarPickerComponent', () => {
  let component: SidebarPickerComponent;
  let fixture: ComponentFixture<SidebarPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
