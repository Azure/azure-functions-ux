import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidepanelExampleComponent } from './sidepanel-example.component';

describe('SidepanelExampleComponent', () => {
  let component: SidepanelExampleComponent;
  let fixture: ComponentFixture<SidepanelExampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidepanelExampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidepanelExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
