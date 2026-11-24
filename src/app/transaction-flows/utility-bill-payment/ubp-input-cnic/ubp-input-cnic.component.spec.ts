import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UbpInputCnicComponent } from './ubp-input-cnic.component';

describe('UbpInputCnicComponent', () => {
  let component: UbpInputCnicComponent;
  let fixture: ComponentFixture<UbpInputCnicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UbpInputCnicComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UbpInputCnicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
