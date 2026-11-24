import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtResultComponent } from './mt-result.component';

describe('MtResultComponent', () => {
  let component: MtResultComponent;
  let fixture: ComponentFixture<MtResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MtResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MtResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
