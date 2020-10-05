import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirebaseService } from 'src/app/services/firebase.service';
import { NewUserDialogComponent } from '../dialogs/new-user-dialog/new-user-dialog.component';
import { DialogService } from 'src/app/services/dialog.service';
import { Router } from '@angular/router';
import { User } from 'src/app/models/User';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  title = 'Login';
  create = false;
  submitted = false;
  action = false;

  newuserDialog: MatDialogRef<NewUserDialogComponent>;

  public closedLogin = false;

  loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, LoginComponent.validateEmail]),
    password: new FormControl(null, [Validators.required]),
  });

  matchingEmail: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, LoginComponent.validateEmail]),
    cemail: new FormControl('', [Validators.required]),
  }, LoginComponent.emailMatchValidator);

  matchingPassword: FormGroup = new FormGroup({
    password: new FormControl(null, [Validators.required, Validators.minLength(8), Validators.maxLength(64), LoginComponent.validatePW]),
    cpassword: new FormControl(null, [Validators.required]),
  }, LoginComponent.passwordMatchValidator);

  accountForm: FormGroup = new FormGroup({
    firstname: new FormControl(null, [Validators.required, Validators.minLength(2)]),
    lastname: new FormControl(null, [Validators.required, Validators.minLength(2)]),
    matchingEmail: this.matchingEmail,
    matchingPassword: this.matchingPassword,
  });

  constructor(public snackBar: MatSnackBar, private firebaseService: FirebaseService,
              private dialogService: DialogService, private snackbar: MatSnackBar,
              private router: Router) {}

  static passwordMatchValidator(fg: FormGroup) {
    const password = fg.get('password').value;
    const cpassword = fg.get('cpassword').value;

    if (password === cpassword) {
      fg.get('cpassword').setErrors(null);
      return null;
    } else {
      fg.get('cpassword').setErrors({ mismatch: true });
      return { mismatch: true };
    }
  }

  static emailMatchValidator(fg: FormGroup) {
    const email = fg.get('email').value;
    const cemail = fg.get('cemail').value;

    if (email.toLowerCase() === cemail.toLowerCase()) {
      fg.get('cemail').setErrors(null);
      return null;
    } else {
      fg.get('cemail').setErrors({ mismatch: true });
      return { mismatch: true };
    }
  }

  static validatePW(fc: FormControl) {
    // old
    // const PW_REGEXP = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@!%*?&()])[A-Za-z\d$@!%*?&]{8,}/;

    // new but needs a ton of client side validation and an api backend to check against commonly used passwords
    // lots of work but security is the name of the game :D
    const PW_REGEXP = /^.{8,64}$/;


    return PW_REGEXP.test(fc.value) ? null : {
      pw: true
    };
  }

  static validateEmail(fc: FormControl): any {
    // tslint:disable-next-line: max-line-length
    const EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,12}))/i;

    return EMAIL_REGEXP.test(fc.value) ? null : {
      email: true
    };
  }

  ngOnInit(): void {
  }

  public openSnackBar(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 1500,
    });
  }

  public loginOpened(): void {
    this.closedLogin = true;
  }

  public closeLogin(): void {
    this.closedLogin = false;
  }

  public loginWithEmail(): void {
    this.firebaseService.loginWithEmailProvider(this.loginForm.controls.email.value.toLowerCase(),
      this.loginForm.controls.password.value).then();
  }

  createUserLogin(): void {
    this.submitted = true;
    this.firebaseService.createUserFromEmail(
      this.matchingEmail.controls.email.value.toLowerCase(), this.matchingPassword.controls.password.value,
      this.accountForm.controls.firstname.value, this.accountForm.controls.lastname.value).then((user) => {
        if (this.firebaseService.user) {
          this.snackBar.open('Created account: ' + this.matchingEmail.controls.email.value.toLowerCase(), 'OK', { duration: 2000 });
          this.toLogin();
          this.action = true;

          this.newuserDialog = this.dialogService.openDialog(NewUserDialogComponent, {});
          this.newuserDialog.componentInstance.firebaseService = this.firebaseService;
          this.newuserDialog.afterClosed().subscribe((result: User | false) => {
            if (result) {
              this.router.navigateByUrl(`/about/${result.vanity}`);
            }
          });
        } else {
          // Snackbar handled by service
          this.submitted = false;
        }
      });
  }

  public toCreateAccount() {
    this.create = true;
    this.title = 'Create Account';
  }

  public toLogin() {
    this.create = false;
    this.title = 'Login';
  }
}
