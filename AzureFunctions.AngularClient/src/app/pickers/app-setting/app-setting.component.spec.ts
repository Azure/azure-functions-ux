import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSettingComponent } from './app-setting.component';

describe('AppSettingComponent', () => {
  let component: AppSettingComponent;
  let fixture: ComponentFixture<AppSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
