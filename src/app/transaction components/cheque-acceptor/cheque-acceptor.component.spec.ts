import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChequeAcceptorComponent } from './cheque-acceptor.component';

describe('ChequeAcceptorComponent', () => {
  let component: ChequeAcceptorComponent;
  let fixture: ComponentFixture<ChequeAcceptorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChequeAcceptorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChequeAcceptorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
