import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdOtherDepositorDetailComponent } from './cd-other-depositor-detail.component';

describe('CdOtherDepositorDetailComponent', () => {
  let component: CdOtherDepositorDetailComponent;
  let fixture: ComponentFixture<CdOtherDepositorDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdOtherDepositorDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdOtherDepositorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
