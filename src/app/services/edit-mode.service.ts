import { Injectable } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditModeService {

  public editMode: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() { }
}
