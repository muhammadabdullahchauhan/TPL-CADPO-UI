import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePrefrencesComponent } from './change-prefrences.component';

describe('ChangePrefrencesComponent', () => {
  let component: ChangePrefrencesComponent;
  let fixture: ComponentFixture<ChangePrefrencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangePrefrencesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangePrefrencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
