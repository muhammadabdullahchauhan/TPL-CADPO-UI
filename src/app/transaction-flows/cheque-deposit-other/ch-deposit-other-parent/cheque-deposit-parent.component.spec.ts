import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashDepositOtherParentComponent } from './cash-deposit-parent.component';

describe('CashDepositParentComponent', () => {
  let component: CashDepositOtherParentComponent;
  let fixture: ComponentFixture<CashDepositOtherParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashDepositOtherParentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashDepositOtherParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
