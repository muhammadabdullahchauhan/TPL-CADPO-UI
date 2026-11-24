import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashAcceptorComponent } from './cash-acceptor.component';

describe('CashAcceptorComponent', () => {
  let component: CashAcceptorComponent;
  let fixture: ComponentFixture<CashAcceptorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashAcceptorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashAcceptorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
