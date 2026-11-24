import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdOtherBanksSelectionComponent } from './cd-other-banks-selection.component';

describe('CdOtherBanksSelectionComponent', () => {
  let component: CdOtherBanksSelectionComponent;
  let fixture: ComponentFixture<CdOtherBanksSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdOtherBanksSelectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdOtherBanksSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
