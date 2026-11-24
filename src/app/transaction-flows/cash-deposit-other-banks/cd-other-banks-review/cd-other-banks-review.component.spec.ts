import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdOtherBanksReviewComponent } from './cd-other-banks-review.component';

describe('CdOtherBanksReviewComponent', () => {
  let component: CdOtherBanksReviewComponent;
  let fixture: ComponentFixture<CdOtherBanksReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdOtherBanksReviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdOtherBanksReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
