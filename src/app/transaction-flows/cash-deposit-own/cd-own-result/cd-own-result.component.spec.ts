import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdOwnResultComponent } from './cd-own-result.component';

describe('CdOwnResultComponent', () => {
  let component: CdOwnResultComponent;
  let fixture: ComponentFixture<CdOwnResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdOwnResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdOwnResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
