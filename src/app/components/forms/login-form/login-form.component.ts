import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, LoginFormComponent.validateEmail]),
    password: new FormControl(null, [Validators.required]),
  });

  constructor(private firebaseService: FirebaseService) { }

  static validateEmail(fc: FormControl): any {
    // tslint:disable-next-line: max-line-length
    const EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,12}))/i;

    return EMAIL_REGEXP.test(fc.value) ? null : {
      email: true
    };
  }

  public loginWithEmail(): void {
    this.firebaseService.loginWithEmailProvider(this.loginForm.controls.email.value.toLowerCase(),
      this.loginForm.controls.password.value);
  }

  public loginWithGoogle(): void {
    this.firebaseService.loginWithGoogleProvider();
  }

  ngOnInit(): void {
  }
}
