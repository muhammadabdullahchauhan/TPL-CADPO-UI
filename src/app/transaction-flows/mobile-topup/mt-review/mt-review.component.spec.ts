import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtReviewComponent } from './mt-review.component';

describe('MtReviewComponent', () => {
  let component: MtReviewComponent;
  let fixture: ComponentFixture<MtReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MtReviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MtReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
