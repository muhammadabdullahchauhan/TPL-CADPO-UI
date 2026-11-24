import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdOtherResultComponent } from './cd-other-result.component';

describe('CdOtherResultComponent', () => {
  let component: CdOtherResultComponent;
  let fixture: ComponentFixture<CdOtherResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdOtherResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdOtherResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
