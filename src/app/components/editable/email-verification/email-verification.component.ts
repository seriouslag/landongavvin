import { Component, OnInit, Input } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from 'src/app/models/User';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss']
})
export class EmailVerificationComponent {

  @Input()
  editMode!: boolean;

  @Input()
  editUser!: User;

  constructor(private firebaseService: FirebaseService) { }

  public async sendEmailVerification(): Promise<void> {
    await this.firebaseService.sendEmailVerification();
  }

}
