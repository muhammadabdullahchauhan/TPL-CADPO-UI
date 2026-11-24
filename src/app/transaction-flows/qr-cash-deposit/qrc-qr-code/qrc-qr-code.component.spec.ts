import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrcQrCodeComponent } from './qrc-qr-code.component';

describe('QrcQrCodeComponent', () => {
  let component: QrcQrCodeComponent;
  let fixture: ComponentFixture<QrcQrCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QrcQrCodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrcQrCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
