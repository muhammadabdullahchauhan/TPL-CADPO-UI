import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdOwnBeneficiaryDetailsComponent } from './cd-own-beneficiary-details.component';

describe('CdOwnBeneficiaryDetailsComponent', () => {
  let component: CdOwnBeneficiaryDetailsComponent;
  let fixture: ComponentFixture<CdOwnBeneficiaryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdOwnBeneficiaryDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdOwnBeneficiaryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
