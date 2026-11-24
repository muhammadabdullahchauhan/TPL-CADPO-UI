import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UbpResultComponent } from './ubp-result.component';

describe('UbpResultComponent', () => {
  let component: UbpResultComponent;
  let fixture: ComponentFixture<UbpResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UbpResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UbpResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
