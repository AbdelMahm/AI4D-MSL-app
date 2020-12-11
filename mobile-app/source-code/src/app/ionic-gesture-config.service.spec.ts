import { TestBed } from '@angular/core/testing';

import { IonicGestureConfigService } from './ionic-gesture-config.service';

describe('IonicGestureConfigService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IonicGestureConfigService = TestBed.get(IonicGestureConfigService);
    expect(service).toBeTruthy();
  });
});
