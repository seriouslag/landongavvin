import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, AbstractControl } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  loginForm: UntypedFormGroup = new UntypedFormGroup({
    email: new UntypedFormControl(null, [Validators.required, LoginFormComponent.validateEmail]),
    password: new UntypedFormControl(null, [Validators.required]),
  });

  constructor(private firebaseService: FirebaseService) { }

  static validateEmail(fc: AbstractControl) {
    // tslint:disable-next-line: max-line-length
    const EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,12}))/i;

    return EMAIL_REGEXP.test(fc.value) ? null : {
      email: true
    };
  }

  public async loginWithEmail(): Promise<void> {
    await this.firebaseService.loginWithEmailProvider(this.loginForm.controls.email.value.toLowerCase(),
      this.loginForm.controls.password.value);
  }

  public async loginWithGoogle(): Promise<void> {
    await this.firebaseService.loginWithGoogleProvider();
  }

  ngOnInit(): void {
  }
}
