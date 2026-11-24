import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtParentComponent } from './mt-parent.component';

describe('MtParentComponent', () => {
  let component: MtParentComponent;
  let fixture: ComponentFixture<MtParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MtParentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MtParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
