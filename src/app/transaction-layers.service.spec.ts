import { TestBed } from '@angular/core/testing';

import { TransactionLayersService } from './transaction-layers.service';

describe('TransactionLayersService', () => {
  let service: TransactionLayersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionLayersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
