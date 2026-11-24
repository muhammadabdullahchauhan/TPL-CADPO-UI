import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtTopupCompaniesComponent } from './mt-topup-companies.component';

describe('MtTopupCompaniesComponent', () => {
  let component: MtTopupCompaniesComponent;
  let fixture: ComponentFixture<MtTopupCompaniesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MtTopupCompaniesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MtTopupCompaniesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
