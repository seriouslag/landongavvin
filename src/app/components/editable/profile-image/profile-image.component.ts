import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.scss']
})
export class ProfileImageComponent {

  @Input()
  src: string;

  @Input()
  editMode: boolean;

  constructor() { }
}
