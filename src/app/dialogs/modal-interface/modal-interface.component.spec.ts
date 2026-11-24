import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInterfaceComponent } from './modal-interface.component';

describe('ModalInterfaceComponent', () => {
  let component: ModalInterfaceComponent;
  let fixture: ComponentFixture<ModalInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalInterfaceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
