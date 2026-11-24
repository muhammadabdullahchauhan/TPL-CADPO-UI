import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChTellerReviewComponent } from './ch-teller-review.component';

describe('ChTellerReviewComponent', () => {
  let component: ChTellerReviewComponent;
  let fixture: ComponentFixture<ChTellerReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChTellerReviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChTellerReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
