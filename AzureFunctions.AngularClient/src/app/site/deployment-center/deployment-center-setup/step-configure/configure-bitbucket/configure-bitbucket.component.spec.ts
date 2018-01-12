import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureBitbucketComponent } from './configure-bitbucket.component';

describe('ConfigureBitbucketComponent', () => {
  let component: ConfigureBitbucketComponent;
  let fixture: ComponentFixture<ConfigureBitbucketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureBitbucketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureBitbucketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
