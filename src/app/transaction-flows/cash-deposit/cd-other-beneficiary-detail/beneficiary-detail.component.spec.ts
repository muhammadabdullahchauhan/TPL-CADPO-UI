import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdOtherBeneficiaryDetailComponent } from './beneficiary-detail.component';

describe('BeneficiaryDetailComponent', () => {
  let component: CdOtherBeneficiaryDetailComponent;
  let fixture: ComponentFixture<CdOtherBeneficiaryDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdOtherBeneficiaryDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdOtherBeneficiaryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
