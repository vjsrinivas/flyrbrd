import { TestBed } from '@angular/core/testing';

import { JsondbService } from './jsondb.service';

describe('JsondbService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JsondbService = TestBed.get(JsondbService);
    expect(service).toBeTruthy();
  });
});
