import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JavaSplashPageComponent } from './java-splash-page.component';

describe('JavaSplashPageComponent', () => {
  let component: JavaSplashPageComponent;
  let fixture: ComponentFixture<JavaSplashPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JavaSplashPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JavaSplashPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
