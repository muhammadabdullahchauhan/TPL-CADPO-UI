import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChOwnResultComponent } from './ch-own-result.component';

describe('ChOwnResultComponent', () => {
  let component: ChOwnResultComponent;
  let fixture: ComponentFixture<ChOwnResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChOwnResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChOwnResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
