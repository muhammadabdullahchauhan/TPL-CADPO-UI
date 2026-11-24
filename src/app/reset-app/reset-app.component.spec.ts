import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetAppComponent } from './reset-app.component';

describe('ResetAppComponent', () => {
  let component: ResetAppComponent;
  let fixture: ComponentFixture<ResetAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResetAppComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
