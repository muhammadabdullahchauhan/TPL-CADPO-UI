import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtTransactionInputComponent } from './mt-transaction-input.component';

describe('MtTransactionInputComponent', () => {
  let component: MtTransactionInputComponent;
  let fixture: ComponentFixture<MtTransactionInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MtTransactionInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MtTransactionInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
