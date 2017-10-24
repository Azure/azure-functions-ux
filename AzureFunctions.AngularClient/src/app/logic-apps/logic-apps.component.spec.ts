import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogicAppsComponent } from './logic-apps.component';

describe('LogicAppsComponent', () => {
  let component: LogicAppsComponent;
  let fixture: ComponentFixture<LogicAppsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogicAppsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogicAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
