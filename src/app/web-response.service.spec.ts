import { TestBed } from '@angular/core/testing';

import { WebResponseService } from './web-response.service';

describe('WebResponseService', () => {
  let service: WebResponseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebResponseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
