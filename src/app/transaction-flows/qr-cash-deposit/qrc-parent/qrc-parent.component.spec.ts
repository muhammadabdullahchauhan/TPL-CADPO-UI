import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrcParentComponent } from './qrc-parent.component';

describe('QrcParentComponent', () => {
  let component: QrcParentComponent;
  let fixture: ComponentFixture<QrcParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QrcParentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrcParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
