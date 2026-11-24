import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdOtherDepositComponent } from './cd-other-deposit.component';

describe('CdOtherDepositComponent', () => {
  let component: CdOtherDepositComponent;
  let fixture: ComponentFixture<CdOtherDepositComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdOtherDepositComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdOtherDepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
