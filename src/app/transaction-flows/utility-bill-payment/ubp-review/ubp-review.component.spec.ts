import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UbpReviewComponent } from './ubp-review.component';

describe('UbpReviewComponent', () => {
  let component: UbpReviewComponent;
  let fixture: ComponentFixture<UbpReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UbpReviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UbpReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
