import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrReviewComponent } from './qr-review.component';

describe('QrReviewComponent', () => {
  let component: QrReviewComponent;
  let fixture: ComponentFixture<QrReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QrReviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
