import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-new-user-dialog',
  templateUrl: './new-user-dialog.component.html',
  styleUrls: ['./new-user-dialog.component.scss']
})
export class NewUserDialogComponent implements OnInit {

  firebaseService: FirebaseService;

  occupationForm: FormGroup = new FormGroup({
    occupation: new FormControl(null, [Validators.required])
  });
  companyForm: FormGroup = new FormGroup({
    company: new FormControl(null, [Validators.required])
  });
  bioForm: FormGroup = new FormGroup({
    bio: new FormControl(null, [Validators.required])
  });

  constructor(private newuserDialog: MatDialogRef<NewUserDialogComponent>) { }

  ngOnInit() {
  }

  public sendEmailVerification() {
    this.firebaseService.sendEmailVerification();
  }

  public saveInfo(): void {
    this.newuserDialog.close(1);
  }

  public cancel(): void {
    this.newuserDialog.close(0);
  }

}
