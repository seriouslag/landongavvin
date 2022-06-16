import { Component, OnInit, OnDestroy } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntypedFormGroup, UntypedFormControl, Validators, AbstractControl, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { DialogService } from 'src/app/services/dialog.service';
import { User } from 'src/app/models/User';
import { take } from 'rxjs/operators';
import { UserUpdateRequest } from 'src/app/models/UserUpdateRequest';
import { QuestionDialogComponent } from 'src/app/components/dialogs/question-dialog/question-dialog.component';

const VanityValidator: ValidatorFn = (fc: AbstractControl) => {
  const VANITY_REGEXP = /^[a-zA-Z0-9]{2,29}$/;

return VANITY_REGEXP.test(fc.value) ? null : {
  vanityCheck: true
};
  }

@Component({
  selector: 'app-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.scss']
})
export class AccountPageComponent implements OnInit, OnDestroy {

  private userSubscription: Subscription|undefined;

  user: User|null;

  confirmDialog: MatDialogRef<QuestionDialogComponent>|undefined;

  settingsForm: UntypedFormGroup = new UntypedFormGroup({
    firstname: new UntypedFormControl(null, [Validators.minLength(2)]),
    lastname: new UntypedFormControl(null, [Validators.minLength(2)]),
    vanity: new UntypedFormControl(null,
      [Validators.minLength(3), Validators.maxLength(30), VanityValidator], [this.vanityMatchValidator.bind(this)])
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
    this.userSubscription?.unsubscribe();
  }

  private async vanityMatchValidator(control: AbstractControl) {
    if (!this.user) return null;
    const vanityCheck = control.value;

    const check = false;
    // should do check  on backend to see if request vanity is available but this works for now
    const vanities = await lastValueFrom(this.firebaseService.getAllVanities()
      .snapshotChanges()
      .pipe(
        take(1)
      ));
    for (const vanity of vanities) {
      if (vanity.key === vanityCheck && vanityCheck !== this.user.vanity) {
        return { vanityInUse: true };
      }
    }

    if (check === false) {
      return null;
    }
    return null;
  }

  public async resetPassword(): Promise<void> {
    if (!this.user) {
      this.snackBar.open('No user is logged in.', 'OK', { duration: 5000 });
      return;
    }
    this.confirmDialog = this.dialogService.openDialog(QuestionDialogComponent, {});
    this.confirmDialog.componentInstance.customText = 'Reset Password?';
    this.confirmDialog.componentInstance.showButtonText = true;

    const result: number = await lastValueFrom(this.confirmDialog.afterClosed());

    if (result !== 1) return;
    try {
      await this.firebaseService.sendPasswordResetEmail(this.user.email, {});
      this.snackBar.open('Password reset email sent to ' + this.user.email + '.', 'OK', { duration: 5000 });
    } catch(err) {
      this.snackBar.open('Something went wrong, try again later.', 'OK', { duration: 5000 });
    }
  }

  public async saveUserInfo(): Promise<void> {
    if (!this.user) {
      this.snackBar.open('No user is logged in.', 'OK', { duration: 5000 });
      return;
    }
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
      await this.firebaseService.setUserVanity(this.settingsForm.controls.vanity.value);
    }

    await this.firebaseService.updateUserInfo(update);

    this.snackBar.open('You account information has been updated :D', 'OK', { duration: 3000 });
  }
}
