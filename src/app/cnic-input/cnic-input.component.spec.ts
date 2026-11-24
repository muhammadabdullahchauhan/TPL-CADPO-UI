import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnicInputComponent } from './cnic-input.component';

describe('CnicInputComponent', () => {
  let component: CnicInputComponent;
  let fixture: ComponentFixture<CnicInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CnicInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CnicInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
