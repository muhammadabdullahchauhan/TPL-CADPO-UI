import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UbpTransactionInputComponent } from './ubp-transaction-input.component';

describe('UbpTransactionInputComponent', () => {
  let component: UbpTransactionInputComponent;
  let fixture: ComponentFixture<UbpTransactionInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UbpTransactionInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UbpTransactionInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
