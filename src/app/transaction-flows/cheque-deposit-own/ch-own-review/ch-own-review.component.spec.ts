import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChOwnReviewComponent } from './ch-own-review.component';

describe('ChOwnReviewComponent', () => {
  let component: ChOwnReviewComponent;
  let fixture: ComponentFixture<ChOwnReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChOwnReviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChOwnReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
