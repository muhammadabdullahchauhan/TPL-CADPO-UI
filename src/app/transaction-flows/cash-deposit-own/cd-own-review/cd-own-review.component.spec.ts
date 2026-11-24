import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdOwnReviewComponent } from './cd-own-review.component';

describe('CdOwnReviewComponent', () => {
  let component: CdOwnReviewComponent;
  let fixture: ComponentFixture<CdOwnReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdOwnReviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdOwnReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
