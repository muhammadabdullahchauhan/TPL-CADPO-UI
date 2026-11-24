import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggedAccountsComponent } from './tagged-accounts.component';

describe('TaggedAccountsComponent', () => {
  let component: TaggedAccountsComponent;
  let fixture: ComponentFixture<TaggedAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaggedAccountsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaggedAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
