import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdOtherBanksResultComponent } from './cd-other-banks-result.component';

describe('CdOtherBanksResultComponent', () => {
  let component: CdOtherBanksResultComponent;
  let fixture: ComponentFixture<CdOtherBanksResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdOtherBanksResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdOtherBanksResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
