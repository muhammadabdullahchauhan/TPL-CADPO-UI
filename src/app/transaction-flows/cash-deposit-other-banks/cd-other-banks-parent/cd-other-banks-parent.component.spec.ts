import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdOtherBanksParentComponent } from './cd-other-banks-parent.component';

describe('CdOtherBanksParentComponent', () => {
  let component: CdOtherBanksParentComponent;
  let fixture: ComponentFixture<CdOtherBanksParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdOtherBanksParentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdOtherBanksParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
