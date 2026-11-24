import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashDepositOwnParentComponent } from './cash-deposit-own-parent.component';

describe('CashDepositOwnParentComponent', () => {
  let component: CashDepositOwnParentComponent;
  let fixture: ComponentFixture<CashDepositOwnParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashDepositOwnParentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashDepositOwnParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
