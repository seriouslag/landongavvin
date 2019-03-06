import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { DialogService } from 'src/app/services/dialog.service';
import { User } from 'src/app/models/User';
import { take } from 'rxjs/operators';
import { UserUpdateRequest } from 'src/app/models/UserUpdateRequest';
import { QuestionDialogComponent } from 'src/app/components/dialogs/question-dialog/question-dialog.component';

@Component({
  selector: 'app-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.scss']
})
export class AccountPageComponent implements OnInit, OnDestroy {

  private userSubscription: Subscription;

  user: User;

  confirmDialog: MatDialogRef<QuestionDialogComponent>;

  settingsForm: FormGroup = new FormGroup({
    firstname: new FormControl(null, [Validators.minLength(2)]),
    lastname: new FormControl(null, [Validators.minLength(2)]),
    vanity: new FormControl(null,
      [Validators.minLength(3), Validators.maxLength(30), AccountPageComponent.validateVanity], [this.vanityMatchValidator.bind(this)])
  });

  constructor(private firebaseService: FirebaseService, private dialogService: DialogService, private snackBar: MatSnackBar) {
    this.user = {
      fname: 'First', lname: 'Last', email: '',
      bio: '', job: '', company: '',
      twitch: '', youtube: '', facebook: '',
      twitter: '', linkedin: '', instagram: '',
      resumeLink: '', vanity: 'Vanity', dateCreated: '',
      github: '',
      uid: '', image: '', isVerified: false
    } as User;
  }

  static validateVanity(fc: FormControl) {
    const VANITY_REGEXP = /^[a-zA-Z0-9]{2,29}$/;

    return VANITY_REGEXP.test(fc.value) ? null : {
      vanityCheck: true
    };
  }

  ngOnInit() {
    this.userSubscription = this.firebaseService.user.subscribe((user) => {
      this.user = user;
      if (!user) {
        user = {} as User;
      }
      this.settingsForm.controls.firstname.patchValue(user.fname || '');
      this.settingsForm.controls.lastname.patchValue(user.lname || '');
      this.settingsForm.controls.vanity.patchValue(user.vanity || user.uid ? user.uid.toLowerCase() : '');
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private vanityMatchValidator(control: AbstractControl): Promise<any> {
    const vanityCheck = control.value;

    const check = false;
    // should do check  on backend to see if request vanity is available but this works for now
    return new Promise(resolve => {
      const req = this.firebaseService.getAllVanities().snapshotChanges();
      req
      .pipe(
        take(1)
      ).subscribe(vanities => {
        for (const vanity of vanities) {
          if (vanity.key === vanityCheck && vanityCheck !== this.user.vanity) {
            return resolve({ vanityInUse: true });
          }
        }

        if (check === false) {
          return resolve(null);
        }
      });
    });
  }

  public resetPassword(): void {
    this.confirmDialog = this.dialogService.openDialog(QuestionDialogComponent, {});
    this.confirmDialog.componentInstance.customText = 'Reset Password?';
    this.confirmDialog.componentInstance.showButtonText = true;

    this.confirmDialog.afterClosed().pipe(take(1)).subscribe(result => {
      if (result === 1) {
        this.firebaseService.sendPasswordResetEmail(this.user.email, {}).then(() => {
          this.snackBar.open('Password reset email sent to ' + this.user.email + '.', 'OK', { duration: 5000 });
        }).catch(() => {
          this.snackBar.open('Something went wrong, try again later.', 'OK', { duration: 5000 });
        });
      } else {
        // Did nothing
      }
    });

  }

  public saveUserInfo(): void {
    const update: UserUpdateRequest = {
      fname: '', lname: ''
    };
    if (this.user.fname !== this.settingsForm.controls.firstname.value) {
      update.fname = this.settingsForm.controls.firstname.value;
    }
    if (this.user.lname !== this.settingsForm.controls.lastname.value) {
      update.lname = this.settingsForm.controls.lastname.value;
    }
    if (this.user.vanity !== this.settingsForm.controls.vanity.value) {
      this.firebaseService.setUserVanity(this.settingsForm.controls.vanity.value);
    }

    this.firebaseService.updateUserInfo(update);

    this.snackBar.open('You account information has been updated :D', 'OK', { duration: 3000 });
  }
}
