import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChTellerParentComponent } from './ch-teller-parent.component';

describe('ChTellerParentComponent', () => {
  let component: ChTellerParentComponent;
  let fixture: ComponentFixture<ChTellerParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChTellerParentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChTellerParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
