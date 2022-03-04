import { TestBed } from '@angular/core/testing';

import { TownsService } from './towns.service';

describe('TownsService', () => {
  let service: TownsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TownsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
