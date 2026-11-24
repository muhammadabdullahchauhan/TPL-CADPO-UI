import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdOtherBanksInputDetailsComponent } from './cd-other-banks-input-details.component';

describe('CdOtherBanksInputDetailsComponent', () => {
  let component: CdOtherBanksInputDetailsComponent;
  let fixture: ComponentFixture<CdOtherBanksInputDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdOtherBanksInputDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdOtherBanksInputDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
