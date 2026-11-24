import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdOtherReviewComponent } from './cd-other-review.component';

describe('CdOtherReviewComponent', () => {
  let component: CdOtherReviewComponent;
  let fixture: ComponentFixture<CdOtherReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdOtherReviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdOtherReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
