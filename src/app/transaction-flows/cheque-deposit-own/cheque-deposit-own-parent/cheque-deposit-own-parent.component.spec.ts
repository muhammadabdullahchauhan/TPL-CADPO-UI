import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChequeDepositOwnParentComponent } from './cheque-deposit-own-parent.component';

describe('ChequeDepositOwnParentComponent', () => {
  let component: ChequeDepositOwnParentComponent;
  let fixture: ComponentFixture<ChequeDepositOwnParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChequeDepositOwnParentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChequeDepositOwnParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
