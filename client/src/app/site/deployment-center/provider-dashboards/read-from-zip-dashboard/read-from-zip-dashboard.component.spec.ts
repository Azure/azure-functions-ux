import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadFromZipDashboardComponent } from './read-from-zip-dashboard.component';

describe('ReadFromZipDashboardComponent', () => {
  let component: ReadFromZipDashboardComponent;
  let fixture: ComponentFixture<ReadFromZipDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReadFromZipDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadFromZipDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
