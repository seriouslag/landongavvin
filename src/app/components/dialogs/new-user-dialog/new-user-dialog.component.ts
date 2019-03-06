import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { User } from 'src/app/models/User';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-user-dialog',
  templateUrl: './new-user-dialog.component.html',
  styleUrls: ['./new-user-dialog.component.scss']
})
export class NewUserDialogComponent implements OnInit {

  firebaseService: FirebaseService;
  user: User;
  userSubscription: Subscription;

  occupationForm: FormGroup = new FormGroup({
    occupation: new FormControl(null, [Validators.required])
  });
  companyForm: FormGroup = new FormGroup({
    company: new FormControl(null, [Validators.required])
  });
  bioForm: FormGroup = new FormGroup({
    bio: new FormControl(null, [Validators.required])
  });

  constructor(private newuserDialog: MatDialogRef<NewUserDialogComponent>, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.userSubscription = this.firebaseService.user.subscribe((user) => {
      this.user = user;
    });
  }

  public sendEmailVerification() {
    this.firebaseService.sendEmailVerification();
  }

  public async saveInfo(): Promise<void> {
    const updateObject = {
      job: this.occupationForm.controls.occupation.value,
      company: this.companyForm.controls.company.value,
      bio: this.bioForm.controls.bio.value
    };
    try {
      await this.firebaseService.updateUserInfo(updateObject);
      this.snackBar.open('Your profile has been updated.', 'OK', { duration: 2000 });
    } catch (e) {
      console.log(e);
      this.snackBar.open('Your profile failed to update.', 'OK', { duration: 2000 });
    }

    this.newuserDialog.close(this.user);
  }

  public cancel(): void {
    this.newuserDialog.close(false);
  }
}
