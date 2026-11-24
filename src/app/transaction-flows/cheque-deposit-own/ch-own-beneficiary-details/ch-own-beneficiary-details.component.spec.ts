import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChOwnBeneficiaryDetailsComponent } from './ch-own-beneficiary-details.component';

describe('ChOwnBeneficiaryDetailsComponent', () => {
  let component: ChOwnBeneficiaryDetailsComponent;
  let fixture: ComponentFixture<ChOwnBeneficiaryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChOwnBeneficiaryDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChOwnBeneficiaryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
