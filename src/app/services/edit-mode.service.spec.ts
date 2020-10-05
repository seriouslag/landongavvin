import { TestBed } from '@angular/core/testing';
import { EditModeService } from './edit-mode.service';


describe('EditModeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EditModeService = TestBed.inject(EditModeService);
    expect(service).toBeTruthy();
  });
});
