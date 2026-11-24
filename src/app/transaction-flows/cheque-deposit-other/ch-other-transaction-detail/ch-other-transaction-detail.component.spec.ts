import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdOtherTransactionDetailComponent } from './cd-other-transaction-detail.component';

describe('CdOtherTransactionDetailComponent', () => {
  let component: CdOtherTransactionDetailComponent;
  let fixture: ComponentFixture<CdOtherTransactionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdOtherTransactionDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdOtherTransactionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
