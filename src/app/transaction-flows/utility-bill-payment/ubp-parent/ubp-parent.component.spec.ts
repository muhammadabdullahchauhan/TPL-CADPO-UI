import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UbpParentComponent } from './ubp-parent.component';

describe('UbpParentComponent', () => {
  let component: UbpParentComponent;
  let fixture: ComponentFixture<UbpParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UbpParentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UbpParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
