import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UbpBillPaymentComponent } from './ubp-bill-payment.component';

describe('UbpBillPaymentComponent', () => {
  let component: UbpBillPaymentComponent;
  let fixture: ComponentFixture<UbpBillPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UbpBillPaymentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UbpBillPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
